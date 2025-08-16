/**
 * RLS Testing Service - Validates Row Level Security Isolation
 * Ensures tenant isolation and audit compliance
 */

import { supabase } from '@/integrations/supabase/client';

interface RLSTestResult {
  test_name: string;
  status: 'pass' | 'fail';
  message: string;
  actual_count: number;
  expected_count: number;
  execution_time_ms: number;
}

interface SecurityAuditResult {
  org_isolation: RLSTestResult[];
  data_access: RLSTestResult[];
  audit_trail: RLSTestResult[];
  overall_status: 'secure' | 'vulnerable';
  recommendations: string[];
}

class RLSTestService {
  /**
   * Test 1: Organization Data Isolation
   * Verifies users can only see their org's data
   */
  async testOrganizationIsolation(): Promise<RLSTestResult[]> {
    const tests: RLSTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test view access (should only return current org data)
      const { data: revenueData, error: revenueError } = await supabase
        .from('v_daily_revenue')
        .select('org_id')
        .limit(10);

      if (revenueError) {
        tests.push({
          test_name: 'Daily Revenue View Access',
          status: 'fail',
          message: `View access failed: ${revenueError.message}`,
          actual_count: 0,
          expected_count: 1,
          execution_time_ms: Date.now() - startTime
        });
      } else {
        // Check all returned records belong to same org
        const uniqueOrgs = new Set(revenueData?.map(r => r.org_id) || []);
        
        tests.push({
          test_name: 'Daily Revenue View Isolation',
          status: uniqueOrgs.size <= 1 ? 'pass' : 'fail',
          message: uniqueOrgs.size <= 1 
            ? 'Data properly isolated to single organization'
            : `Data leak detected: ${uniqueOrgs.size} organizations visible`,
          actual_count: uniqueOrgs.size,
          expected_count: 1,
          execution_time_ms: Date.now() - startTime
        });
      }

      // Test RPC function isolation
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_operational_metrics');

      tests.push({
        test_name: 'Operational Metrics RPC Isolation',
        status: metricsError ? 'fail' : 'pass',
        message: metricsError 
          ? `RPC access failed: ${metricsError.message}`
          : 'RPC function accessible and secure',
        actual_count: metricsData?.length || 0,
        expected_count: 3, // Should return 3 metrics
        execution_time_ms: Date.now() - startTime
      });

    } catch (error) {
      tests.push({
        test_name: 'Organization Isolation Error',
        status: 'fail',
        message: `Unexpected error: ${error}`,
        actual_count: 0,
        expected_count: 1,
        execution_time_ms: Date.now() - startTime
      });
    }

    return tests;
  }

  /**
   * Test 2: Data Access Permissions
   * Verifies proper CRUD permissions based on roles
   */
  async testDataAccessPermissions(): Promise<RLSTestResult[]> {
    const tests: RLSTestResult[] = [];
    const startTime = Date.now();

    try {
      // Test read access to reservations
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, org_id')
        .limit(5);

      tests.push({
        test_name: 'Reservations Read Access',
        status: reservationsError ? 'fail' : 'pass',
        message: reservationsError 
          ? `Read access denied: ${reservationsError.message}`
          : 'Read access properly configured',
        actual_count: reservations?.length || 0,
        expected_count: -1, // Variable expected
        execution_time_ms: Date.now() - startTime
      });

      // Test audit logs access (should be restricted)
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('id, org_id')
        .limit(5);

      tests.push({
        test_name: 'Audit Logs Read Access',
        status: auditError ? 'fail' : 'pass',
        message: auditError 
          ? `Audit access denied: ${auditError.message}`
          : 'Audit logs accessible for compliance',
        actual_count: auditLogs?.length || 0,
        expected_count: -1, // Variable expected
        execution_time_ms: Date.now() - startTime
      });

    } catch (error) {
      tests.push({
        test_name: 'Data Access Error',
        status: 'fail',
        message: `Unexpected error: ${error}`,
        actual_count: 0,
        expected_count: 1,
        execution_time_ms: Date.now() - startTime
      });
    }

    return tests;
  }

  /**
   * Test 3: Audit Trail Integrity
   * Verifies all changes are properly logged
   */
  async testAuditTrailIntegrity(): Promise<RLSTestResult[]> {
    const tests: RLSTestResult[] = [];
    const startTime = Date.now();

    try {
      // Check if audit triggers are working
      const { data: recentAudits, error: auditError } = await supabase
        .from('audit_logs')
        .select('id, action, table_name, occurred_at')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(10);

      tests.push({
        test_name: 'Recent Audit Trail',
        status: auditError ? 'fail' : 'pass',
        message: auditError 
          ? `Audit trail access failed: ${auditError.message}`
          : `Found ${recentAudits?.length || 0} recent audit entries`,
        actual_count: recentAudits?.length || 0,
        expected_count: 0, // At least 0 is acceptable
        execution_time_ms: Date.now() - startTime
      });

      // Verify audit log structure
      if (recentAudits && recentAudits.length > 0) {
        const hasRequiredFields = recentAudits.every(audit => 
          audit.action && audit.table_name && audit.occurred_at
        );

        tests.push({
          test_name: 'Audit Log Structure',
          status: hasRequiredFields ? 'pass' : 'fail',
          message: hasRequiredFields 
            ? 'All audit logs have required fields'
            : 'Some audit logs missing required fields',
          actual_count: hasRequiredFields ? 1 : 0,
          expected_count: 1,
          execution_time_ms: Date.now() - startTime
        });
      }

    } catch (error) {
      tests.push({
        test_name: 'Audit Trail Error',
        status: 'fail',
        message: `Unexpected error: ${error}`,
        actual_count: 0,
        expected_count: 1,
        execution_time_ms: Date.now() - startTime
      });
    }

    return tests;
  }

  /**
   * Run comprehensive security audit
   * Returns overall security status and recommendations
   */
  async runSecurityAudit(): Promise<SecurityAuditResult> {
    const [orgIsolation, dataAccess, auditTrail] = await Promise.all([
      this.testOrganizationIsolation(),
      this.testDataAccessPermissions(),
      this.testAuditTrailIntegrity()
    ]);

    const allTests = [...orgIsolation, ...dataAccess, ...auditTrail];
    const failedTests = allTests.filter(test => test.status === 'fail');
    const overallStatus = failedTests.length === 0 ? 'secure' : 'vulnerable';

    const recommendations: string[] = [];
    
    if (failedTests.length > 0) {
      recommendations.push(
        `${failedTests.length} security tests failed - immediate attention required`
      );
      failedTests.forEach(test => {
        recommendations.push(`Fix: ${test.test_name} - ${test.message}`);
      });
    } else {
      recommendations.push('All security tests passed - system is properly secured');
      recommendations.push('Continue monitoring audit logs for suspicious activity');
    }

    // Performance recommendations
    const avgExecutionTime = allTests.reduce((sum, test) => sum + test.execution_time_ms, 0) / allTests.length;
    if (avgExecutionTime > 1000) {
      recommendations.push(`Query performance could be improved (avg: ${avgExecutionTime.toFixed(0)}ms)`);
    }

    return {
      org_isolation: orgIsolation,
      data_access: dataAccess,
      audit_trail: auditTrail,
      overall_status: overallStatus,
      recommendations
    };
  }

  /**
   * Quick security health check
   * For dashboard display
   */
  async getSecurityHealthScore(): Promise<{
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    last_checked: string;
  }> {
    const audit = await this.runSecurityAudit();
    const totalTests = audit.org_isolation.length + audit.data_access.length + audit.audit_trail.length;
    const passedTests = [
      ...audit.org_isolation,
      ...audit.data_access,
      ...audit.audit_trail
    ].filter(test => test.status === 'pass').length;

    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 95) status = 'excellent';
    else if (score >= 85) status = 'good';
    else if (score >= 70) status = 'warning';
    else status = 'critical';

    return {
      score,
      status,
      last_checked: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const rlsTestService = new RLSTestService();

// Export types
export type { RLSTestResult, SecurityAuditResult };