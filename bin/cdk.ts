#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { StorageStack } from '../lib/storage-stack';
import { SqsStack } from '../lib/sqs-stack';
import { MonitoringStack } from '../lib/monitoring-stack';
import { RiskManagementStack } from '../lib/RiskManagementStack';
import { ComplianceTrackingStack } from '../lib/complianceTrackingStack';

const app = new cdk.App();
new ApiStack(app, 'ApiStack');
new StorageStack(app, 'StorageStack');
new SqsStack(app, 'SqsStack');
new MonitoringStack(app, 'MonitoringStack');
new RiskManagementStack(app, 'RiskManagementStack');
new ComplianceTrackingStack(app, 'ComplianceTrackingStack');

