import Foundation

enum XP {
    static let lesson = 10
    static let quizCorrect = 15
    static let labTask = 25
}

struct Lesson: Hashable {
    let title: String
    let body: String
}

struct Question: Hashable {
    let prompt: String
    let options: [String]
    let answer: Int
}

struct LabTask: Hashable {
    let hint: String
    let pattern: String   // regular expression the learner's command must match
    let output: [String]

    func matches(_ command: String) -> Bool {
        command.range(of: pattern, options: [.regularExpression, .caseInsensitive]) != nil
    }
}

struct TrainingModule: Identifiable, Hashable {
    let id: String
    let title: String
    let symbol: String    // SF Symbol name
    let level: String
    let lessons: [Lesson]
    let quiz: [Question]
    let labIntro: String
    let lab: [LabTask]

    func key(_ kind: String, _ index: Int) -> String { "\(id):\(kind):\(index)" }

    var allKeys: [String] {
        lessons.indices.map { key("lesson", $0) }
            + quiz.indices.map { key("quiz", $0) }
            + lab.indices.map { key("lab", $0) }
    }
}

extension TrainingModule {
    static let all: [TrainingModule] = [
        TrainingModule(
            id: "phishing",
            title: "Phishing & Email Security",
            symbol: "envelope.badge.shield.half.filled",
            level: "Beginner",
            lessons: [
                Lesson(title: "Spot the red flags", body: "Urgency, look-alike sender domains, links whose real URL differs from the text, unexpected attachments and requests for credentials or payment."),
                Lesson(title: "SPF, DKIM and DMARC", body: "SPF lists which servers may send for a domain, DKIM signs messages, and DMARC tells receivers what to do when checks fail. A failure on a 'bank' email is a strong phishing signal."),
                Lesson(title: "Respond safely", body: "Report, don't click. If someone entered credentials: reset the password, revoke sessions and check mailbox forwarding rules."),
            ],
            quiz: [
                Question(prompt: "\"paypa1-support.com\" asks you to verify within 2 hours. Strongest red flag?", options: ["Uses your name", "Look-alike domain plus urgency", "Has a logo", "Sent in the morning"], answer: 1),
                Question(prompt: "Which record lists the servers allowed to send a domain's email?", options: ["DKIM", "DMARC", "SPF", "MX"], answer: 2),
                Question(prompt: "A user entered their password on a phishing page. First step?", options: ["Delete the email", "Reset password and revoke sessions", "Reboot", "Ignore it"], answer: 1),
            ],
            labIntro: "A suspicious email was saved as suspicious.eml. Investigate it.",
            lab: [
                LabTask(hint: "List files: ls", pattern: #"^ls(\s|$)"#, output: ["suspicious.eml  notes.txt"]),
                LabTask(hint: "Check sender and SPF: grep -i spf suspicious.eml", pattern: #"^grep\s.*(spf|from).*suspicious\.eml"#, output: ["From: <alert@paypa1-support.com>", "Received-SPF: fail"]),
                LabTask(hint: "Look up the domain: whois paypa1-support.com", pattern: #"^whois\s+paypa1-support\.com"#, output: ["Creation Date: 2 days ago", "Verdict: look-alike domain → PHISHING"]),
            ]
        ),
        TrainingModule(
            id: "network",
            title: "Network Recon & Ports",
            symbol: "network.badge.shield.half.filled",
            level: "Beginner",
            lessons: [
                Lesson(title: "Ports and services", body: "22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB, 3389 RDP. Every open port is attack surface."),
                Lesson(title: "Scanning with nmap", body: "-sV detects versions, -p- scans all ports, -sC runs default scripts. Only scan systems you're authorised to test."),
            ],
            quiz: [
                Question(prompt: "Which port does RDP use?", options: ["22", "443", "3389", "8080"], answer: 2),
                Question(prompt: "Which nmap flag detects service versions?", options: ["-sV", "-Pn", "-oN", "-v"], answer: 0),
            ],
            labIntro: "You're authorised to assess 10.10.0.5. Find what's exposed.",
            lab: [
                LabTask(hint: "ping -c 1 10.10.0.5", pattern: #"^ping\s.*10\.10\.0\.5"#, output: ["64 bytes from 10.10.0.5: icmp_seq=1 ttl=64", "0% packet loss"]),
                LabTask(hint: "nmap -sV 10.10.0.5", pattern: #"^nmap\s+.*-sV.*10\.10\.0\.5"#, output: ["22/tcp   open ssh   OpenSSH 7.2p2", "445/tcp  open smb   Samba 3.X", "3389/tcp open rdp   xrdp"]),
            ]
        ),
        TrainingModule(
            id: "linux-logs",
            title: "Linux Logs & Triage",
            symbol: "terminal",
            level: "Intermediate",
            lessons: [
                Lesson(title: "Where the logs live", body: "SSH logins go to /var/log/auth.log on Ubuntu (/var/log/secure on RHEL). journalctl reads systemd logs."),
                Lesson(title: "Brute force patterns", body: "Hundreds of 'Failed password' lines from one IP, then an 'Accepted password' from the same IP, means the attack likely succeeded."),
            ],
            quiz: [
                Question(prompt: "Where are SSH logins logged on Ubuntu?", options: ["/var/log/syslog", "/var/log/auth.log", "/etc/passwd", "/var/log/kern.log"], answer: 1),
                Question(prompt: "Best long-term fix for SSH brute force?", options: ["Longer banner", "Key auth + fail2ban", "Daily reboot", "More ports"], answer: 1),
            ],
            labIntro: "Unusual SSH activity on web-01. Triage the auth log.",
            lab: [
                LabTask(hint: "grep -c \"Failed password\" /var/log/auth.log", pattern: #"^grep\s+-c\s+.*failed password.*auth\.log"#, output: ["1284"]),
                LabTask(hint: "grep Accepted /var/log/auth.log", pattern: #"^grep\s.*accepted.*auth\.log"#, output: ["Accepted password for deploy from 45.155.205.23", "Finding: brute force succeeded → incident response"]),
                LabTask(hint: "sudo ufw deny from 45.155.205.23", pattern: #"^(sudo\s+)?ufw\s+deny\s+from\s+45\.155\.205\.23"#, output: ["Rule added", "Contained."]),
            ]
        ),
    ]
}
