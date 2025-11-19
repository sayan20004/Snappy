import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var isRegister = false
    @State private var errorMessage: String?
    @StateObject private var auth = AuthService.shared

    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                if isRegister {
                    TextField("Name", text: $name)
                        .textFieldStyle(.roundedBorder)
                }
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .textFieldStyle(.roundedBorder)
                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)

                if let err = errorMessage {
                    Text(err).foregroundColor(.red).font(.footnote)
                }

                Button(isRegister ? "Register" : "Login") {
                    Task {
                        do {
                            if isRegister {
                                try await auth.register(name: name, email: email, password: password)
                            } else {
                                try await auth.login(email: email, password: password)
                            }
                        } catch {
                            errorMessage = "Auth failed: \(error)"
                        }
                    }
                }
                .buttonStyle(.borderedProminent)

                Button(isRegister ? "Have an account? Login" : "No account? Register") {
                    isRegister.toggle()
                }
                .font(.footnote)

                Spacer()
            }
            .padding()
            .navigationTitle(isRegister ? "Register" : "Login")
        }
    }
}
