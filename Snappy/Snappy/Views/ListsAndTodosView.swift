import SwiftUI

struct ListsAndTodosView: View {
    @StateObject private var listService = ListService.shared
    @StateObject private var todoService = TodoService.shared
    @State private var showingAddList = false
    
    var body: some View {
        List {
            NavigationLink(destination: TodoListView(listId: nil)) {
                Label("All Tasks", systemImage: "tray.fill")
            }
            
            Section("My Lists") {
                ForEach(listService.lists) { list in
                    NavigationLink(destination: TodoListView(listId: list.id)) {
                        Label {
                            Text(list.name)
                        } icon: {
                            Image(systemName: list.icon ?? "folder")
                                .foregroundColor(Color(hex: list.color ?? "#007AFF"))
                        }
                    }
                }
            }
            
            Button(action: { showingAddList = true }) {
                Label("New List", systemImage: "plus.circle")
                    .foregroundColor(.blue)
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Tasks")
        .task {
            do {
                try await listService.fetchLists()
            } catch {
                print("Failed to load lists: \(error)")
            }
        }
        .sheet(isPresented: $showingAddList) {
            AddListView()
        }
    }
}

struct AddListView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var description = ""
    @State private var color = "#007AFF"
    @State private var icon = "folder"
    
    let icons = ["folder", "star", "heart", "house", "cart", "bag", "briefcase", "gamecontroller"]
    let colors = ["#007AFF", "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5856D6", "#AF52DE"]
    
    var body: some View {
        NavigationView {
            Form {
                TextField("List Name", text: $name)
                TextField("Description (optional)", text: $description)
                
                Section("Icon") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(icons, id: \.self) { iconName in
                                Image(systemName: iconName)
                                    .font(.title2)
                                    .frame(width: 44, height: 44)
                                    .background(icon == iconName ? Color.blue.opacity(0.2) : Color.clear)
                                    .cornerRadius(8)
                                    .onTapGesture { icon = iconName }
                            }
                        }
                    }
                }
                
                Section("Color") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(colors, id: \.self) { hexColor in
                                Circle()
                                    .fill(Color(hex: hexColor))
                                    .frame(width: 44, height: 44)
                                    .overlay(
                                        Circle().stroke(color == hexColor ? Color.primary : Color.clear, lineWidth: 3)
                                    )
                                    .onTapGesture { color = hexColor }
                            }
                        }
                    }
                }
            }
            .navigationTitle("New List")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            do {
                                try await ListService.shared.createList(name: name, description: description, color: color, icon: icon)
                                dismiss()
                            } catch {
                                print("Failed to create list: \(error)")
                            }
                        }
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
