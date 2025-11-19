import SwiftUI

struct TemplatesView: View {
    @StateObject private var templateService = TemplateService.shared
    @State private var showingAddTemplate = false
    @State private var loading = false
    
    var body: some View {
        NavigationView {
            List {
                ForEach(templateService.templates) { template in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(template.name)
                                .font(.headline)
                            Spacer()
                            if template.isPublic == true {
                                Image(systemName: "globe")
                                    .foregroundColor(.blue)
                            }
                        }
                        
                        if let description = template.description {
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Text("\(template.todos.count) tasks")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Button(action: { applyTemplate(template.id) }) {
                            Label("Apply Template", systemImage: "plus.circle.fill")
                        }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Templates")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingAddTemplate = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .task {
                loading = true
                do {
                    try await templateService.fetchTemplates()
                } catch {
                    print("Failed to load templates: \(error)")
                }
                loading = false
            }
            .sheet(isPresented: $showingAddTemplate) {
                AddTemplateView()
            }
            .overlay {
                if loading {
                    ProgressView()
                }
            }
        }
    }
    
    func applyTemplate(_ templateId: String) {
        Task {
            do {
                try await templateService.applyTemplate(templateId: templateId)
            } catch {
                print("Failed to apply template: \(error)")
            }
        }
    }
}

struct AddTemplateView: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var description = ""
    @State private var category = ""
    @State private var isPublic = false
    @State private var todos: [TemplateTodo] = []
    @State private var newTodoTitle = ""
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Template Name", text: $name)
                TextField("Description", text: $description)
                TextField("Category", text: $category)
                Toggle("Public Template", isOn: $isPublic)
                
                Section("Tasks") {
                    HStack {
                        TextField("Add task", text: $newTodoTitle)
                        Button("Add") {
                            if !newTodoTitle.isEmpty {
                                todos.append(TemplateTodo(id: UUID().uuidString, title: newTodoTitle, note: nil, priority: nil, tags: nil))
                                newTodoTitle = ""
                            }
                        }
                    }
                    
                    ForEach(todos) { todo in
                        Text(todo.title)
                    }
                    .onDelete { todos.remove(atOffsets: $0) }
                }
            }
            .navigationTitle("New Template")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        Task {
                            do {
                                try await TemplateService.shared.createTemplate(
                                    name: name,
                                    description: description.isEmpty ? nil : description,
                                    category: category.isEmpty ? nil : category,
                                    todos: todos,
                                    isPublic: isPublic
                                )
                                dismiss()
                            } catch {
                                print("Failed to create template: \(error)")
                            }
                        }
                    }
                    .disabled(name.isEmpty || todos.isEmpty)
                }
            }
        }
    }
}
