import Foundation

enum APIError: Error {
    case invalidURL
    case serverError(String)
    case decodingError
    case unauthorized
}

final class APIClient {
    static let shared = APIClient()
    private init() {}

    private var token: String? {
        get { UserDefaults.standard.string(forKey: StorageKeys.jwtToken) }
        set { UserDefaults.standard.set(newValue, forKey: StorageKeys.jwtToken) }
    }

    func request<T: Decodable>(_ path: String,
                               method: String = "GET",
                               body: Data? = nil,
                               requiresAuth: Bool = false) async throws -> T {
        guard let url = URL(string: API.baseURL + path) else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if body != nil { req.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        if requiresAuth, let token = token {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        req.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: req)
        if let http = response as? HTTPURLResponse {
            if http.statusCode == 401 { throw APIError.unauthorized }
            guard (200...299).contains(http.statusCode) else {
                let message = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw APIError.serverError(message)
            }
        }

        do {
            let decoded = try JSONDecoder.iso8601.decode(T.self, from: data)
            return decoded
        } catch {
            throw APIError.decodingError
        }
    }

    func setToken(_ token: String?) {
        self.token = token
    }
}

extension JSONDecoder {
    static var iso8601: JSONDecoder {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }
}
