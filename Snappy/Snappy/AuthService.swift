import Foundation
import Combine

final class AuthService: ObservableObject {
    @Published var currentUser: User?

    static let shared = AuthService()

    private init() {}

    func register(name: String, email: String, password: String) async throws -> Void {
        let payload = ["name": name, "email": email, "password": password]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: AuthResponse = try await APIClient.shared.request("/api/auth/register", method: "POST", body: data)
        APIClient.shared.setToken(resp.token)
        DispatchQueue.main.async { if let user = resp.user { self.currentUser = user } }
    }

    func login(email: String, password: String) async throws {
        let payload = ["email": email, "password": password]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: AuthResponse = try await APIClient.shared.request("/api/auth/login", method: "POST", body: data)
        APIClient.shared.setToken(resp.token)
        DispatchQueue.main.async { if let user = resp.user { self.currentUser = user } }
    }

    func fetchMe() async throws {
        struct Resp: Codable { var user: User }
        let resp: Resp = try await APIClient.shared.request("/api/auth/me", requiresAuth: true)
        DispatchQueue.main.async { self.currentUser = resp.user }
    }

    func logout() {
        APIClient.shared.setToken(nil)
        currentUser = nil
    }
}
