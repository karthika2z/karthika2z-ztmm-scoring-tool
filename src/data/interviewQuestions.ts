import type { InterviewQuestion } from '../types/interview';

/**
 * High-level interview questions for voice-based assessment
 * These are designed to be conversational and extract maturity information through natural responses
 */
export const interviewQuestions: InterviewQuestion[] = [
  // Setup Questions
  {
    id: 'setup-customer',
    pillarId: 'setup',
    question: 'What is the customer name and which cloud providers are they currently using?',
    context: 'Basic setup information',
    maturityIndicators: {
      traditional: [],
      initial: [],
      advanced: [],
      optimal: []
    }
  },

  // Networks Pillar
  {
    id: 'networks-segmentation',
    pillarId: 'networks',
    dimensionId: 'segmentationStrategy',
    question: 'How does the customer currently segment their network? What approach do they use for isolating workloads and managing network traffic between different parts of their environment?',
    context: 'Understanding network segmentation maturity',
    maturityIndicators: {
      traditional: ['flat network', 'basic VLANs', 'perimeter-based', 'minimal segmentation'],
      initial: ['VPC/VNet separation', 'subnet-based segmentation', 'some micro-segmentation'],
      advanced: ['comprehensive micro-segmentation', 'software-defined perimeters', 'identity-aware segmentation'],
      optimal: ['zero trust segmentation', 'dynamic policy-based', 'continuous verification', 'automated segmentation']
    }
  },

  {
    id: 'networks-connectivity',
    pillarId: 'networks',
    dimensionId: 'connectivitySolutions',
    question: 'How does the customer connect their different cloud environments and on-premises infrastructure? What technologies do they use for multi-cloud and hybrid cloud connectivity?',
    context: 'Understanding network connectivity architecture',
    maturityIndicators: {
      traditional: ['VPN tunnels', 'manual configuration', 'point-to-point connections'],
      initial: ['cloud native VPN', 'transit gateway', 'some automation'],
      advanced: ['SD-WAN', 'centralized connectivity', 'automated provisioning'],
      optimal: ['cloud network platform', 'multi-cloud transit', 'fully automated', 'policy-driven routing']
    }
  },

  {
    id: 'networks-visibility',
    pillarId: 'networks',
    dimensionId: 'visibilityMonitoring',
    question: 'What visibility do they have into network traffic across their cloud environments? How do they monitor and analyze network flows?',
    context: 'Understanding network visibility and monitoring capabilities',
    maturityIndicators: {
      traditional: ['basic logging', 'limited visibility', 'reactive monitoring'],
      initial: ['flow logs enabled', 'basic dashboards', 'some alerting'],
      advanced: ['comprehensive flow analysis', 'real-time monitoring', 'threat detection'],
      optimal: ['unified visibility across clouds', 'AI-driven analytics', 'predictive monitoring', 'automated response']
    }
  },

  {
    id: 'networks-security',
    pillarId: 'networks',
    dimensionId: 'networkSecurity',
    question: 'What network security controls do they have in place? How do they handle firewall rules, DDoS protection, and network-based threats?',
    context: 'Understanding network security posture',
    maturityIndicators: {
      traditional: ['perimeter firewalls', 'basic ACLs', 'static rules'],
      initial: ['security groups', 'NACLs', 'some IDS/IPS'],
      advanced: ['distributed firewall', 'NGFW', 'threat intelligence integration'],
      optimal: ['zero trust network access', 'AI-powered threat detection', 'automated policy enforcement', 'microsegmentation']
    }
  },

  {
    id: 'networks-egress',
    pillarId: 'networks',
    dimensionId: 'egressStrategy',
    question: 'How do they manage outbound internet traffic from their cloud workloads? What controls and filtering do they have for egress traffic?',
    context: 'Understanding egress control strategy',
    maturityIndicators: {
      traditional: ['direct internet access', 'minimal filtering', 'no centralized control'],
      initial: ['NAT gateways', 'basic URL filtering', 'some egress controls'],
      advanced: ['centralized egress', 'comprehensive filtering', 'TLS inspection'],
      optimal: ['secure web gateway', 'CASB integration', 'zero trust egress', 'complete visibility and control']
    }
  },

  // Applications & Workloads Pillar
  {
    id: 'apps-identity',
    pillarId: 'applicationsWorkloads',
    dimensionId: 'identityWorkloads',
    question: 'How do applications and workloads authenticate and authorize to each other? What identity framework do they use for service-to-service communication?',
    context: 'Understanding workload identity management',
    maturityIndicators: {
      traditional: ['static credentials', 'shared secrets', 'no identity framework'],
      initial: ['service accounts', 'API keys', 'basic RBAC'],
      advanced: ['workload identity', 'certificates', 'SPIFFE/SPIRE'],
      optimal: ['comprehensive workload identity platform', 'automated credential rotation', 'zero trust workload access']
    }
  },

  {
    id: 'apps-encryption',
    pillarId: 'applicationsWorkloads',
    dimensionId: 'encryptionTransit',
    question: 'How is data encrypted when moving between services? What TLS strategy do they have for east-west traffic?',
    context: 'Understanding encryption in transit practices',
    maturityIndicators: {
      traditional: ['no encryption', 'occasional TLS', 'plaintext internal traffic'],
      initial: ['TLS for north-south', 'some mTLS', 'inconsistent'],
      advanced: ['comprehensive mTLS', 'service mesh', 'automated certificate management'],
      optimal: ['universal mTLS', 'short-lived certificates', 'automated policy enforcement', 'transparent encryption']
    }
  },

  {
    id: 'apps-authorization',
    pillarId: 'applicationsWorkloads',
    dimensionId: 'authorizationPolicy',
    question: 'How do they control what services can talk to each other? What authorization policies are enforced between workloads?',
    context: 'Understanding application-level authorization',
    maturityIndicators: {
      traditional: ['network-based only', 'no application authorization', 'implicit trust'],
      initial: ['basic ACLs', 'some application-level controls', 'manual policies'],
      advanced: ['service mesh policies', 'fine-grained authorization', 'API gateways'],
      optimal: ['comprehensive authorization', 'attribute-based access control', 'dynamic policies', 'continuous verification']
    }
  },

  {
    id: 'apps-secrets',
    pillarId: 'applicationsWorkloads',
    dimensionId: 'secretsManagement',
    question: 'How do they manage secrets, API keys, and credentials used by applications? What secrets management solution do they use?',
    context: 'Understanding secrets management practices',
    maturityIndicators: {
      traditional: ['hardcoded credentials', 'config files', 'no secrets management'],
      initial: ['environment variables', 'basic vaults', 'manual rotation'],
      advanced: ['centralized secrets management', 'automated rotation', 'dynamic secrets'],
      optimal: ['comprehensive secrets platform', 'short-lived credentials', 'just-in-time access', 'zero knowledge architecture']
    }
  },

  // Data Pillar
  {
    id: 'data-classification',
    pillarId: 'data',
    dimensionId: 'dataClassification',
    question: 'How do they classify and label their data? What system do they have for understanding data sensitivity?',
    context: 'Understanding data classification approach',
    maturityIndicators: {
      traditional: ['no classification', 'manual labeling', 'inconsistent'],
      initial: ['basic classification scheme', 'some automated tagging', 'partial coverage'],
      advanced: ['comprehensive classification', 'automated discovery', 'policy enforcement'],
      optimal: ['AI-driven classification', 'real-time discovery', 'automated policy application', 'continuous monitoring']
    }
  },

  {
    id: 'data-encryption-rest',
    pillarId: 'data',
    dimensionId: 'encryptionRest',
    question: 'How is data encrypted at rest? What key management strategy do they use?',
    context: 'Understanding data at rest encryption',
    maturityIndicators: {
      traditional: ['no encryption', 'provider-managed keys only', 'inconsistent'],
      initial: ['some encryption enabled', 'beginning to use customer-managed keys'],
      advanced: ['comprehensive encryption', 'customer-managed keys', 'key rotation'],
      optimal: ['universal encryption', 'HSM-backed keys', 'automated key lifecycle', 'bring your own key']
    }
  },

  {
    id: 'data-access-controls',
    pillarId: 'data',
    dimensionId: 'accessControls',
    question: 'How do they control access to sensitive data? What mechanisms ensure only authorized entities can access specific data?',
    context: 'Understanding data access control mechanisms',
    maturityIndicators: {
      traditional: ['basic permissions', 'overly permissive', 'no fine-grained control'],
      initial: ['RBAC implemented', 'some attribute-based controls', 'improving least privilege'],
      advanced: ['fine-grained access control', 'ABAC', 'data masking', 'policy-based'],
      optimal: ['zero trust data access', 'dynamic authorization', 'contextual access', 'continuous verification']
    }
  },

  {
    id: 'data-dlp',
    pillarId: 'data',
    dimensionId: 'dataLossPrevention',
    question: 'What data loss prevention measures do they have? How do they prevent sensitive data from leaving their environment inappropriately?',
    context: 'Understanding DLP capabilities',
    maturityIndicators: {
      traditional: ['no DLP', 'reactive detection', 'minimal controls'],
      initial: ['basic DLP tools', 'some monitoring', 'email DLP'],
      advanced: ['comprehensive DLP', 'real-time prevention', 'API protection'],
      optimal: ['AI-powered DLP', 'unified across all channels', 'automated response', 'predictive prevention']
    }
  },

  // Cross-Cutting Pillar
  {
    id: 'cross-automation',
    pillarId: 'crossCutting',
    dimensionId: 'automationOrchestration',
    question: 'How automated is their security policy enforcement? To what extent is security configuration managed as code?',
    context: 'Understanding automation and orchestration maturity',
    maturityIndicators: {
      traditional: ['manual configuration', 'no automation', 'ad-hoc changes'],
      initial: ['some IaC', 'basic automation', 'inconsistent'],
      advanced: ['comprehensive IaC', 'GitOps workflows', 'automated provisioning'],
      optimal: ['fully automated', 'policy as code', 'self-healing', 'AI-driven optimization']
    }
  },

  {
    id: 'cross-monitoring',
    pillarId: 'crossCutting',
    dimensionId: 'monitoringAlerts',
    question: 'How do they monitor security events and respond to threats? What SIEM or security monitoring do they have in place?',
    context: 'Understanding security monitoring and alerting',
    maturityIndicators: {
      traditional: ['minimal monitoring', 'no centralized logs', 'reactive only'],
      initial: ['log aggregation', 'basic SIEM', 'some alerting'],
      advanced: ['comprehensive SIEM', 'threat intelligence', 'automated correlation'],
      optimal: ['AI-powered security analytics', 'predictive threat detection', 'automated response', 'unified visibility']
    }
  },

  {
    id: 'cross-incident',
    pillarId: 'crossCutting',
    dimensionId: 'incidentResponse',
    question: 'What is their incident response process? How quickly can they detect, respond to, and recover from security incidents?',
    context: 'Understanding incident response capabilities',
    maturityIndicators: {
      traditional: ['no formal process', 'manual investigation', 'slow response'],
      initial: ['documented playbooks', 'some automation', 'improving response times'],
      advanced: ['comprehensive IR platform', 'automated workflows', 'rapid containment'],
      optimal: ['AI-assisted IR', 'automated remediation', 'predictive threat hunting', 'continuous improvement']
    }
  },

  {
    id: 'cross-compliance',
    pillarId: 'crossCutting',
    dimensionId: 'complianceGovernance',
    question: 'How do they manage compliance and governance across their cloud environments? What frameworks are they subject to?',
    context: 'Understanding compliance and governance approach',
    maturityIndicators: {
      traditional: ['manual compliance checks', 'point-in-time audits', 'reactive'],
      initial: ['some automated scanning', 'basic policy enforcement', 'periodic reviews'],
      advanced: ['continuous compliance monitoring', 'automated remediation', 'policy as code'],
      optimal: ['comprehensive governance platform', 'real-time compliance', 'automated attestation', 'predictive risk management']
    }
  }
];

/**
 * Get interview questions by pillar
 */
export function getQuestionsByPillar(pillarId: string): InterviewQuestion[] {
  return interviewQuestions.filter(q => q.pillarId === pillarId);
}

/**
 * Get all interview questions in order
 */
export function getAllInterviewQuestions(): InterviewQuestion[] {
  return interviewQuestions;
}

/**
 * Get setup questions
 */
export function getSetupQuestions(): InterviewQuestion[] {
  return interviewQuestions.filter(q => q.pillarId === 'setup');
}
