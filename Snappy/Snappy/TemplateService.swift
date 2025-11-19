import Foundation
import Combine

final class TemplateService: ObservableObject {
    @Published var templates: [Template] = []
    
    static let shared = TemplateService()
    private init() {}
    
    func fetchTemplates() async throws {
        let resp: TemplatesResponse = try await APIClient.shared.request("/api/templates", requiresAuth: true)
        DispatchQueue.main.async { self.templates = resp.templates }
    }
    
    func createTemplate(name: String, description: String? = nil, category: String? = nil, 
                       todos: [TemplateTodo], isPublic: Bool = false) async throws {
        var payload: [String: Any] = ["name": name, "todos": todos.map { todo in
            var dict: [String: Any] = ["title": todo.title]
            if let note = todo.note { dict["note"] = note }
            if let priority = todo.priority { dict["priority"] = priority }
            if let tags = todo.tags { dict["tags"] = tags }
            return dict
        }, "isPublic": isPublic]
        
        if let description = description { payload["description"] = description }
        if let category = category { payload["category"] = category }
        
        let data = try JSONSerialization.data(withJSONObject: payload)
        let resp: TemplateResponse = try await APIClient.shared.request("/api/templates", method: "POST", body: data, requiresAuth: true)
        DispatchQueue.main.async { self.templates.append(resp.template) }
    }
    
    func applyTemplate(templateId: String, listId: String? = nil) async throws {
        var payload: [String: Any] = [:]
        if let listId = listId { payload["listId"] = listId }
        
        let data = try JSONSerialization.data(withJSONObject: payload)
        struct ApplyResponse: Codable { var todos: [Todo] }
        let resp: ApplyResponse = try await APIClient.shared.request("/api/templates/\(templateId)/apply", method: "POST", body: data, requiresAuth: true)
        
        // Refresh todos
        DispatchQueue.main.async {
            TodoService.shared.todos.insert(contentsOf: resp.todos, at: 0)
        }
    }
    
    func deleteTemplate(id: String) async throws {
        struct Empty: Codable {}
        _ = try await APIClient.shared.request("/api/templates/\(id)", method: "DELETE", requiresAuth: true) as Empty
        DispatchQueue.main.async {
            self.templates.removeAll { $0.id == id }
        }
    }
}
