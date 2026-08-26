import { registerReadOnlyTool } from '../../../packages/webmcp/src/register.js';
registerReadOnlyTool({
  name: 'get_mission', title: 'Get moving mission',
  description: 'Read the current moving-house demo mission and its constraints. Use this before planning actions on partner websites.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute: async () => ({ missionId: 'move-demo-001', missionVersion: 1, goal: 'Move from Newcastle to Gosforth on 18 September 2026', constraints: { broadband: { minimumMbps: 500, maxMonthlyGbp: 35 }, movers: { earliestTime: '10:00', preferredMaxGbp: 350 }, energy: { preferRenewable: true, maxGreenPremiumAnnualGbp: 100 } }, approvalPolicy: 'Ask before any simulated confirmation', serviceDirectory: { broadband: 'https://webmcp-one-broadband.paul-phillips1988.workers.dev', movers: 'https://webmcp-one-movers.paul-phillips1988.workers.dev', energy: 'https://webmcp-one-energy.paul-phillips1988.workers.dev' } })
});
