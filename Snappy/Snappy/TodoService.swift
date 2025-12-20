import Combine
import Foundation

final class TodoService: ObservableObject {
    @Published var todos: [Todo] = []
    @Published var currentTodo: Todo?

    static let shared = TodoService()
    private init() {}

    func fetchTodos(listId: String? = nil, status: String? = nil, tag: String? = nil) async throws {
        var path = "/api/todos?"
        var params: [String] = []
        if let listId = listId { params.append("listId=\(listId)") }
        if let status = status { params.append("status=\(status)") }
        if let tag = tag { params.append("tag=\(tag)") }
        path += params.joined(separator: "&")
        
        let resp: TodoListResponse = try await APIClient.shared.request(path, requiresAuth: true)
        DispatchQueue.main.async { self.todos = resp.todos }
    }

    func createTodo(title: String, note: String? = nil, listId: String? = nil,
                   priority: Int? = nil, tags: [String]? = nil, dueAt: Date? = nil,
                   energyLevel: String? = nil, effortMinutes: Int? = nil) async throws {
        var payload: [String: Any] = ["title": title]
        if let note = note { payload["note"] = note }
        if let listId = listId { payload["listId"] = listId }
        if let priority = priority { payload["priority"] = priority }
        if let tags = tags { payload["tags"] = tags }
        if let dueAt = dueAt { payload["dueAt"] = ISO8601DateFormatter().string(from: dueAt) }
        if let energyLevel = energyLevel { payload["energyLevel"] = energyLevel }
        if let effortMinutes = effortMinutes { payload["effortMinutes"] = effortMinutes }
        
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: TodoResponse = try await APIClient.shared.request("/api/todos", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async { self.todos.insert(resp.todo, at: 0) }
    }

    func updateTodo(id: String, updates: [String: Any]) async throws {
        let data = try JSONSerialization.data(withJSONObject: updates)
        let resp: TodoResponse = try await APIClient.shared.request("/api/todos/\(id)", method: "PATCH", body: data, requiresAuth: true)
        DispatchQueue.main.async {
            if let idx = self.todos.firstIndex(where: { $0.id == resp.todo.id }) {
                self.todos[idx] = resp.todo
            }
        }
    }

    func deleteTodo(id: String) async throws {
        struct Empty: Codable {}
        _ = try await APIClient.shared.request("/api/todos/\(id)", method: "DELETE", requiresAuth: true) as Empty
        DispatchQueue.main.async {
            self.todos.removeAll { $0.id == id }
        }
    }
    
    // MARK: - Comments
    func addComment(todoId: String, text: String) async throws {
        let payload = ["text": text]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: TodoResponse = try await APIClient.shared.request("/api/todos/\(todoId)/comments", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async {
            if let idx = self.todos.firstIndex(where: { $0.id == todoId }) {
                self.todos[idx] = resp.todo
            }
        }
    }
    
    func addReaction(todoId: String, commentId: String, type: String) async throws {
        let payload = ["type": type]
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: TodoResponse = try await APIClient.shared.request("/api/todos/\(todoId)/comments/\(commentId)/reactions", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async {
            if let idx = self.todos.firstIndex(where: { $0.id == todoId }) {
                self.todos[idx] = resp.todo
            }
        }
    }
}
