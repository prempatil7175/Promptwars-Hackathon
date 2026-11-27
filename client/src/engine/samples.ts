import type { SampleDocument } from './types';

export const SYNTHETIC_SAMPLES: SampleDocument[] = [
  {
    id: 'sample-support-ticket',
    title: 'Support Ticket',
    description: 'Billing escalation with synthetic payment cards, phones, IPs, and false-positive order/version traps.',
    fileType: 'txt',
    fileName: 'support-ticket-synthetic.txt',
    isSynthetic: true,
    highlights: ['Email', 'Indian + Intl Phone', 'PAN', 'Luhn Card vs Invalid 16-digit', 'IPv4 + IPv6', 'Order/Version Traps'],
    content: `TICKET #SUP-2026-8841 | Priority: High | Created: 2026-11-27T09:14:22Z
Agent App Build: v2.14.3 (kernel 10.0.0.1, invalid node 299.10.1.1, malformed 2001:::1)

Customer: Aarav Nair (Synthetic Demo Contact)
Primary Email: aarav.nair@example.com
Backup Email: ops-escalation@acme-demo.org
Indian Mobile: +91 98765 43210
Secondary Contact: +44 20 7946 0958
PAN on KYC File: ABCDE1234F
Aadhaar Verification ID: 2345 6789 0124
Invalid Aadhaar Checksum Trap: 2345 6789 0129

Client Origin IPv4: 203.0.113.42
Client Origin IPv6: 2001:db8:85a3::8a2e:370:7334
Order Reference (Not Phone): ORD-9876543210
Invoice Epoch (Not Phone): 1732683947
Luhn-Valid Card Entered: 4532 0151 1283 0366
Rejected Invalid 16-Digit Ref: 4532 0151 1283 0367

Notes: Customer retried checkout twice from 203.0.113.42 before reaching support. Follow up via aarav.nair@example.com.`,
  },
  {
    id: 'sample-clinical-note',
    title: 'Clinical Note',
    description: 'Outpatient intake record with synthetic Aadhaar, PAN, mobile numbers, timestamps, and medical device IDs.',
    fileType: 'txt',
    fileName: 'clinical-note-synthetic.txt',
    isSynthetic: true,
    highlights: ['Aadhaar (Verhoeff)', 'Indian Mobile', 'Email', 'IPv4 Gateway', 'Timestamps & Vitals'],
    content: `OUTPATIENT INTAKE SUMMARY [SYNTHETIC DEMO RECORD]
Encounter Timestamp: 2026-11-27T08:45:00+05:30
EHR Firmware: v4.12.0 | HL7 Gateway: 198.51.100.14 | Invalid Gateway: 192.168.1.300

Patient Alias: Patient_Synthetic_04
Guardian Email: priya.menon@clinic-demo.net
Emergency Mobile: 9811223344
Intl Consulting Physician: +1 (415) 555-0192
Insurance PAN Ref: BNZAA2318J
Aadhaar (Hyphenated): 3456-7890-1238
Diagnostic Batch ID (Not PII): 1845920314
Lab Machine IPv6: fe80::1ff:fe23:4567:890a

Billing Card (Luhn Valid): 4111-1111-1111-1111
Claim Tracking Code (Invalid Luhn): 4111-1111-1111-1112

Assessment: Routine follow-up scheduled. Send lab PDF only after redaction to priya.menon@clinic-demo.net.`,
  },
  {
    id: 'sample-hr-resume',
    title: 'HR Resume',
    description: 'Candidate profile containing repeated synthetic email/phone/PAN occurrences for pseudonymization testing.',
    fileType: 'txt',
    fileName: 'hr-resume-synthetic.txt',
    isSynthetic: true,
    highlights: ['Repeated Entities', 'PAN', 'Aadhaar', 'IPv6 + IPv4', 'Version Numbers'],
    content: `CANDIDATE DOSSIER (100% SYNTHETIC)
Name: Rohan Kulkarni
Email: rohan.k@talent-demo.io
Phone: +91-97654-32109
Alternate Phone: +65 6123 4567
Tax PAN: KLMNP5678R
Aadhaar ID: 456789012341

Portfolio Server IPv4: 198.51.100.88
Portfolio Server IPv6: 2001:0db8:0000:0000:0000:ff00:0042:8329
Kubernetes Release: v1.31.2 | Agent Build: 1732689012
Payroll Verification Card: 5500 0000 0000 0004
Rejected Reference 16-digit: 5500 0000 0000 0009

Declaration: Reach me at rohan.k@talent-demo.io or 9765432109 for onboarding verification (PAN: KLMNP5678R).`,
  },
  {
    id: 'sample-mixed-csv',
    title: 'Mixed CSV',
    description: 'RFC4180 CSV with quoted commas, escaped quotes, embedded newlines, and mixed synthetic PII + false-positive traps.',
    fileType: 'csv',
    fileName: 'customer-export-synthetic.csv',
    isSynthetic: true,
    highlights: ['RFC4180 Quotes', 'Embedded Commas', 'Multi-line Cell', 'Cross-Row Pseudonyms', 'Invalid Card/IP Traps'],
    content: `record_id,customer_name,contact_email,phone,tax_id,aadhaar,card_number,source_ip,notes
REC-1001,"Sharma, Kavya",kavya.sharma@example.org,+91 98201 55432,PQRSX9012K,5678 9012 3458,4532-0151-1283-0366,192.0.2.15,"Tier ""Gold"" user, verified via +91 98201 55432"
REC-1002,"Patel, Dev",dev.patel@demo-mail.com,+1 212 555 0144,WXYZA4321M,6789-0123-4560,4111111111111111,2001:db8::42,"Line 1: kavya.sharma@example.org copied
Line 2: Order ORD-9876543210, version v3.2.1.0"
REC-1003,"System Health Check",noreply@example.net,+49 30 901820,LMNOP1122Q,234567890129,4111111111111119,299.10.1.1,"Invalid Aadhaar/Card/IPv4 traps; epoch 1732683947"`,
  },
];
