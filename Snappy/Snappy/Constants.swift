import Foundation

enum API {
    static var baseURL: String = "http://localhost:5001" // <- change this to your backend URL
}

enum StorageKeys {
    static let jwtToken = "snappy_jwt_token"
}
