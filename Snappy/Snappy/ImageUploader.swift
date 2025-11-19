import Foundation
import UIKit

final class ImageUploader {
    static func uploadAvatar(image: UIImage) async throws -> User {
        guard let token = UserDefaults.standard.string(forKey: StorageKeys.jwtToken) else { throw APIError.unauthorized }
        guard let url = URL(string: API.baseURL + "/api/users/me/avatar") else { throw APIError.invalidURL }

        let boundary = UUID().uuidString
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let imageData = image.jpegData(compressionQuality: 0.8) ?? Data()

        var body = Data()
        body.appendString("--\(boundary)\r\n")
        body.appendString("Content-Disposition: form-data; name=\"avatar\"; filename=\"avatar.jpg\"\r\n")
        body.appendString("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        body.appendString("\r\n")
        body.appendString("--\(boundary)--\r\n")

        req.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: req)
        if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
            throw APIError.serverError(String(data: data, encoding: .utf8) ?? "Upload failed")
        }

        struct Resp: Codable { var user: User }
        let resp = try JSONDecoder.iso8601.decode(Resp.self, from: data)
        return resp.user
    }
}

fileprivate extension Data {
    mutating func appendString(_ string: String) {
        if let d = string.data(using: .utf8) { append(d) }
    }
}
