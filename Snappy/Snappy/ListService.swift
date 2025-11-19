import Foundation
import Combine
final class ListService: ObservableObject {
    @Published var lists: [TodoList] = []
    
    static let shared = ListService()
    private init() {}
    
    func fetchLists() async throws {
        let resp: ListsResponse = try await APIClient.shared.request("/api/lists", requiresAuth: true)
        DispatchQueue.main.async { self.lists = resp.lists }
    }
    
    func createList(name: String, description: String? = nil, color: String? = nil, icon: String? = nil) async throws {
        var payload: [String: Any] = ["name": name]
        if let description = description { payload["description"] = description }
        if let color = color { payload["color"] = color }
        if let icon = icon { payload["icon"] = icon }
        
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: ListResponse = try await APIClient.shared.request("/api/lists", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async { self.lists.append(resp.list) }
    }
    
    func updateList(id: String, updates: [String: Any]) async throws {
        let data = try JSONSerialization.data(withJSONObject: updates)
        let resp: ListResponse = try await APIClient.shared.request("/api/lists/\(id)", method: "PATCH", body: data, requiresAuth: true)
        DispatchQueue.main.async {
            if let idx = self.lists.firstIndex(where: { $0.id == id }) {
                self.lists[idx] = resp.list
            }
        }
    }
    
    func deleteList(id: String) async throws {
        struct Empty: Codable {}
        _ = try await APIClient.shared.request("/api/lists/\(id)", method: "DELETE", requiresAuth: true) as Empty
        DispatchQueue.main.async {
            self.lists.removeAll { $0.id == id }
        }
    }
    
    func inviteCollaborator(listId: String, email: String, role: String = "editor") async throws {
        let payload = ["email": email, "role": role]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: ListResponse = try await APIClient.shared.request("/api/lists/\(listId)/invite", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async {
            if let idx = self.lists.firstIndex(where: { $0.id == listId }) {
                self.lists[idx] = resp.list
            }
        }
    }
}
