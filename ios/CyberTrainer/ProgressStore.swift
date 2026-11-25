import Foundation

/// Tracks XP and completed items, persisted to UserDefaults.
@MainActor
final class ProgressStore: ObservableObject {
    @Published private(set) var xp: Int
    @Published private(set) var done: Set<String>

    private let defaults: UserDefaults
    private static let xpKey = "progress.xp"
    private static let doneKey = "progress.done"

    static let ranks = ["Recruit", "Analyst I", "Analyst II", "Threat Hunter", "Incident Responder", "Security Lead"]

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.xp = defaults.integer(forKey: Self.xpKey)
        self.done = Set(defaults.stringArray(forKey: Self.doneKey) ?? [])
    }

    var level: Int { xp / 100 + 1 }
    var rank: String { Self.ranks[min(level - 1, Self.ranks.count - 1)] }
    var progressToNext: Double { Double(xp % 100) / 100 }

    func isDone(_ key: String) -> Bool { done.contains(key) }

    /// Awards XP once per unique key, e.g. "phishing:quiz:2".
    func award(_ key: String, xp amount: Int) {
        guard !done.contains(key) else { return }
        done.insert(key)
        xp += amount
        save()
    }

    func completion(of module: TrainingModule) -> Double {
        let keys = module.allKeys
        guard !keys.isEmpty else { return 0 }
        return Double(keys.filter(isDone).count) / Double(keys.count)
    }

    func reset() {
        xp = 0
        done = []
        save()
    }

    private func save() {
        defaults.set(xp, forKey: Self.xpKey)
        defaults.set(Array(done), forKey: Self.doneKey)
    }
}
