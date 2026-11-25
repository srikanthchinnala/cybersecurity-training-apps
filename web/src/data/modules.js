// Course content: each module has lessons, a quiz and a simulated terminal lab.
// Lab tasks: the learner's command must match 'accept'; 'output' lines are printed back.

export const XP = { lesson: 10, quizCorrect: 15, labTask: 25 };

export const modules = [
  {
    id: 'phishing',
    title: 'Phishing & Email Security',
    icon: '🎣',
    level: 'Beginner',
    lessons: [
      { title: 'What phishing looks like', body: 'Phishing tricks people into giving away credentials or running malware. Red flags: urgency ("account locked in 24h"), a mismatched sender domain, links whose real URL differs from the text, unexpected attachments, and requests for passwords or payments.' },
      { title: 'Check the headers', body: 'Email headers show the real path of a message. SPF says which servers may send for a domain, DKIM signs the message, and DMARC tells receivers what to do when SPF/DKIM fail. A "fail" on these for a bank email is a strong phishing signal.' },
      { title: 'Respond safely', body: 'Do not click or reply. Report it through your phishing button or to the SOC, then block the sender and URL. If someone already clicked, reset their password, revoke sessions and check their mailbox rules for forwarding.' },
    ],
    quiz: [
      { q: 'An email from "paypa1-support.com" asks you to verify your account within 2 hours. What is the strongest red flag?', options: ['It uses your first name', 'Look-alike domain plus urgency', 'It has a logo', 'It arrived in the morning'], answer: 1 },
      { q: 'Which control lets a domain owner publish which servers may send its email?', options: ['DKIM', 'DMARC', 'SPF', 'TLS'], answer: 2 },
      { q: 'A user clicked a phishing link and entered their password. First action?', options: ['Delete the email', 'Reset the password and revoke sessions', 'Reboot the laptop', 'Ignore it'], answer: 1 },
    ],
    lab: {
      intro: 'You are a SOC analyst. A suspicious email was saved as suspicious.eml. Investigate it.',
      tasks: [
        { hint: 'List the files in the current directory', accept: /^ls(\s|$)/, output: ['suspicious.eml  notes.txt'] },
        { hint: 'Show the sender and authentication results: grep -i "from\\|spf" suspicious.eml', accept: /^grep\s.*(spf|from).*suspicious\.eml/i, output: ['From: "PayPal Support" <alert@paypa1-support.com>', 'Received-SPF: fail (domain paypa1-support.com does not designate 185.220.101.4 as permitted sender)'] },
        { hint: 'Extract URLs from the email: grep -o "http[^ ]*" suspicious.eml', accept: /^grep\s+-o\s.*http.*suspicious\.eml/i, output: ['http://paypa1-support.com/verify?id=88213'] },
        { hint: 'Look up the domain owner: whois paypa1-support.com', accept: /^whois\s+paypa1-support\.com/i, output: ['Domain Name: PAYPA1-SUPPORT.COM', 'Creation Date: 2 days ago', 'Registrar: cheap-domains.example', 'Verdict: newly registered look-alike domain → PHISHING'] },
      ],
    },
  },
  {
    id: 'network',
    title: 'Network Recon & Ports',
    icon: '🛰️',
    level: 'Beginner',
    lessons: [
      { title: 'Ports and services', body: 'Services listen on ports: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB, 3389 RDP. Every open port is attack surface. Close what you do not need and restrict the rest by source IP.' },
      { title: 'Scanning with nmap', body: 'nmap discovers hosts and open ports. -sV detects service versions, -p- scans all 65535 ports, -sC runs default scripts. Only scan systems you are authorised to test.' },
      { title: 'Reading the results', body: 'Old versions (for example OpenSSH 7.2 or SMBv1) point to known CVEs. RDP or SMB exposed to the internet is a common ransomware entry point and should be behind a VPN.' },
    ],
    quiz: [
      { q: 'Which port is RDP?', options: ['22', '443', '3389', '8080'], answer: 2 },
      { q: 'Which nmap flag detects service versions?', options: ['-sV', '-Pn', '-oN', '-v'], answer: 0 },
      { q: 'SMB (445) is open to the internet. Best fix?', options: ['Change the port number', 'Block it at the firewall and use a VPN', 'Rename the server', 'Disable logging'], answer: 1 },
    ],
    lab: {
      intro: 'You are authorised to assess the lab host 10.10.0.5. Find what is exposed.',
      tasks: [
        { hint: 'Check the host is up: ping -c 1 10.10.0.5', accept: /^ping\s+(-c\s*\d+\s+)?10\.10\.0\.5/, output: ['64 bytes from 10.10.0.5: icmp_seq=1 ttl=64 time=0.41 ms', '1 packets transmitted, 1 received, 0% packet loss'] },
        { hint: 'Scan with version detection: nmap -sV 10.10.0.5', accept: /^nmap\s+.*-sV.*10\.10\.0\.5/, output: ['PORT     STATE SERVICE       VERSION', '22/tcp   open  ssh           OpenSSH 7.2p2', '80/tcp   open  http          Apache 2.4.18', '445/tcp  open  microsoft-ds  Samba smbd 3.X', '3389/tcp open  ms-wbt-server xrdp'] },
        { hint: 'Check SMB for anonymous shares: smbclient -L //10.10.0.5 -N', accept: /^smbclient\s+-L\s+\/\/10\.10\.0\.5/, output: ['Sharename  Type  Comment', 'public     Disk  Anonymous access enabled', 'Finding: anonymous SMB share → restrict or disable'] },
      ],
    },
  },
  {
    id: 'linux-logs',
    title: 'Linux Logs & Incident Triage',
    icon: '🐧',
    level: 'Intermediate',
    lessons: [
      { title: 'Where the logs are', body: 'On Debian/Ubuntu, authentication events are in /var/log/auth.log (RHEL: /var/log/secure). Web servers log to /var/log/nginx or /var/log/apache2. journalctl reads systemd logs.' },
      { title: 'Spotting brute force', body: 'Many "Failed password" lines from one IP in a short time is a brute-force attack. A "Accepted password" from that same IP afterwards means it probably succeeded and the host needs incident response.' },
      { title: 'Contain and harden', body: 'Block the IP, disable password SSH logins (use keys), install fail2ban, check for new users, cron jobs and authorized_keys entries the attacker might have added.' },
    ],
    quiz: [
      { q: 'Which file holds SSH login attempts on Ubuntu?', options: ['/var/log/syslog', '/var/log/auth.log', '/etc/passwd', '/var/log/kern.log'], answer: 1 },
      { q: '500 failed logins then 1 success from the same IP means…', options: ['Normal usage', 'Likely successful brute force', 'A DNS issue', 'Disk failure'], answer: 1 },
      { q: 'Best long-term fix for SSH brute force?', options: ['Longer banner', 'Key-based auth + fail2ban', 'Reboot daily', 'Open more ports'], answer: 1 },
    ],
    lab: {
      intro: 'Alerts show unusual SSH activity on web-01. Triage the auth log.',
      tasks: [
        { hint: 'Count failed passwords: grep -c "Failed password" /var/log/auth.log', accept: /^grep\s+-c\s+.*failed password.*auth\.log/i, output: ['1284'] },
        { hint: 'Find the top attacking IPs: grep "Failed password" /var/log/auth.log | awk \'{print $11}\' | sort | uniq -c | sort -rn | head', accept: /^grep\s.*failed password.*\|.*(awk|cut).*\|.*sort/i, output: ['   1251 45.155.205.23', '     21 103.77.12.9', '     12 10.10.0.14'] },
        { hint: 'Did the attacker get in? grep "Accepted" /var/log/auth.log | grep 45.155.205.23', accept: /^grep\s.*accepted.*45\.155\.205\.23/i, output: ['Nov 24 02:13:44 web-01 sshd[2211]: Accepted password for deploy from 45.155.205.23 port 51122 ssh2', 'Finding: brute force SUCCEEDED for user deploy → start incident response'] },
        { hint: 'Block the IP: sudo ufw deny from 45.155.205.23', accept: /^(sudo\s+)?(ufw\s+deny\s+from|iptables\s+-A\s+INPUT\s+-s)\s+45\.155\.205\.23/i, output: ['Rule added', 'Contained. Next: rotate the deploy password, check ~/.ssh/authorized_keys and crontab.'] },
      ],
    },
  },
  {
    id: 'web',
    title: 'Web App Security (OWASP)',
    icon: '🕸️',
    level: 'Intermediate',
    lessons: [
      { title: 'OWASP Top 10', body: 'The most common web risks include broken access control, cryptographic failures, injection (SQL, command), insecure design, security misconfiguration and vulnerable components.' },
      { title: 'SQL injection', body: "When input is concatenated into SQL, a payload like ' OR 1=1-- changes the query logic. The fix is parameterised queries (prepared statements), never string building." },
      { title: 'Security headers', body: 'Headers like Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options and X-Frame-Options reduce XSS, downgrade and clickjacking risk. Check them with curl -I.' },
    ],
    quiz: [
      { q: 'The correct fix for SQL injection is…', options: ['Input length limits', 'Parameterised queries', 'Hiding error messages', 'Using POST instead of GET'], answer: 1 },
      { q: 'Which header mitigates clickjacking?', options: ['X-Frame-Options', 'Server', 'ETag', 'Accept'], answer: 0 },
      { q: 'HSTS forces…', options: ['Cookies to be HttpOnly', 'Browsers to use HTTPS', 'Passwords to rotate', 'CORS'], answer: 1 },
    ],
    lab: {
      intro: 'Assess the staging site https://shop.lab (you are authorised).',
      tasks: [
        { hint: 'Inspect response headers: curl -I https://shop.lab', accept: /^curl\s+(-I|--head)\s+https?:\/\/shop\.lab/i, output: ['HTTP/2 200', 'server: nginx/1.14.0', 'content-type: text/html', 'Finding: no CSP, HSTS or X-Frame-Options; server version disclosed'] },
        { hint: "Test the login for SQL injection: curl -d \"user=admin' OR 1=1--&pass=x\" https://shop.lab/login", accept: /^curl\s.*-d\s.*(or\s*1=1|'\s*or).*shop\.lab\/login/i, output: ['HTTP/2 302 → /dashboard', 'Finding: authentication bypass via SQL injection (CRITICAL)'] },
        { hint: 'Run a scanner against the site: nikto -h https://shop.lab', accept: /^nikto\s+-h\s+https?:\/\/shop\.lab/i, output: ['+ Server: nginx/1.14.0 (outdated)', '+ /admin/: Admin login page found', '+ /backup.zip: Backup file found, may contain source code', 'Report ready: 1 critical, 2 high, 3 medium'] },
      ],
    },
  },
];
