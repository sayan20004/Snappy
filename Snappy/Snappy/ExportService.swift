import Foundation
import Combine 
final class ExportService {
    static let shared = ExportService()
    private init() {}
    
    // Export to JSON
    func exportJSON() async throws -> Data {
        struct ExportResp: Codable { var data: ExportData }
        let resp: ExportResp = try await APIClient.shared.request("/api/export/json", requiresAuth: true)
        return try JSONEncoder().encode(resp.data)
    }
    
    // Export to CSV
    func exportCSV() async throws -> String {
        struct CSVResp: Codable { var csv: String }
        let resp: CSVResp = try await APIClient.shared.request("/api/export/csv", requiresAuth: true)
        return resp.csv
    }
    
    // Import from JSON
    func importJSON(data: Data) async throws {
        struct ImportResp: Codable { var imported: Int }
        _ = try await APIClient.shared.request("/api/import/json", method: "POST", body: data, requiresAuth: true) as ImportResp
        
        // Refresh todos and lists
        try await TodoService.shared.fetchTodos()
        try await ListService.shared.fetchLists()
    }
    
    // Save to Files app
    func saveToFile(data: Data, filename: String) throws -> URL {
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent(filename)
        try data.write(to: fileURL)
        return fileURL
    }
}
