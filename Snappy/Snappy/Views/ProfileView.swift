import SwiftUI
import PhotosUI

struct ProfileView: View {
    @StateObject private var auth = AuthService.shared
    @State private var showingImagePicker = false
    @State private var selectedImage: UIImage? = nil
    @State private var showingExportOptions = false

    var body: some View {
        NavigationView {
            List {
                Section {
                    HStack {
                        Spacer()
                        VStack(spacing: 16) {
                            if let user = auth.currentUser {
                                if let urlStr = user.avatarUrl,
                                   let url = URL(string: urlStr.hasPrefix("http") ? urlStr : API.baseURL + urlStr) {
                                    AsyncImage(url: url) { phase in
                                        switch phase {
                                        case .empty:
                                            ProgressView()
                                        case .success(let image):
                                            image
                                                .resizable()
                                                .scaledToFit()
                                                .frame(width: 120, height: 120)
                                                .clipShape(Circle())
                                        case .failure:
                                            Image(systemName: "person.crop.circle.badge.exclam")
                                                .resizable()
                                                .frame(width: 120, height: 120)
                                        @unknown default:
                                            EmptyView()
                                        }
                                    }
                                } else {
                                    Image(systemName: "person.crop.circle.fill")
                                        .resizable()
                                        .frame(width: 120, height: 120)
                                }

                                Text(user.name).font(.title2)
                                Text(user.email).font(.subheadline).foregroundColor(.secondary)
                            }
                        }
                        Spacer()
                    }
                    
                    Button(action: { showingImagePicker = true }) {
                        Label("Change Avatar", systemImage: "photo")
                    }
                }
                
                Section("Data Management") {
                    Button(action: { showingExportOptions = true }) {
                        Label("Export Data", systemImage: "square.and.arrow.up")
                    }
                    
                    Button(action: { importData() }) {
                        Label("Import Data", systemImage: "square.and.arrow.down")
                    }
                }
                
                Section {
                    Button(action: { auth.logout() }) {
                        Label("Logout", systemImage: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $showingImagePicker) {
                ImagePicker(image: $selectedImage)
                    .onDisappear {
                        if let img = selectedImage {
                            Task {
                                do {
                                    let user = try await ImageUploader.uploadAvatar(image: img)
                                    DispatchQueue.main.async { auth.currentUser = user }
                                } catch {
                                    print("Upload error: \(error)")
                                }
                            }
                        }
                    }
            }
            .confirmationDialog("Export Format", isPresented: $showingExportOptions) {
                Button("Export as JSON") { exportJSON() }
                Button("Export as CSV") { exportCSV() }
                Button("Cancel", role: .cancel) {}
            }
        }
    }
    
    func exportJSON() {
        Task {
            do {
                let data = try await ExportService.shared.exportJSON()
                let url = try ExportService.shared.saveToFile(data: data, filename: "snappy-export-\(Date().timeIntervalSince1970).json")
                shareFile(url)
            } catch {
                print("Export error: \(error)")
            }
        }
    }
    
    func exportCSV() {
        Task {
            do {
                let csv = try await ExportService.shared.exportCSV()
                let data = csv.data(using: .utf8) ?? Data()
                let url = try ExportService.shared.saveToFile(data: data, filename: "snappy-export-\(Date().timeIntervalSince1970).csv")
                shareFile(url)
            } catch {
                print("Export error: \(error)")
            }
        }
    }
    
    func importData() {
        // In a real app, use UIDocumentPickerViewController
        print("Import functionality - requires document picker integration")
    }
    
    func shareFile(_ url: URL) {
        let activityVC = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = scene.windows.first,
           let rootVC = window.rootViewController {
            rootVC.present(activityVC, animated: true)
        }
    }
}

// Minimal ImagePicker wrapper
struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?

    func makeUIViewController(context: Context) -> some UIViewController {
        var cfg = PHPickerConfiguration()
        cfg.filter = .images
        cfg.selectionLimit = 1
        let picker = PHPickerViewController(configuration: cfg)
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: ImagePicker
        init(_ parent: ImagePicker) { self.parent = parent }
        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)
            guard let result = results.first else { return }
            if result.itemProvider.canLoadObject(ofClass: UIImage.self) {
                result.itemProvider.loadObject(ofClass: UIImage.self) { obj, _ in
                    DispatchQueue.main.async {
                        self.parent.image = obj as? UIImage
                    }
                }
            }
        }
    }
}
