/**
 * Server Actions — Barrel Export
 *
 * All server actions are organized by domain:
 *  - auth.actions.ts       → Registration & authentication
 *  - lottery.actions.ts    → Rooms: list, create, buy tickets
 *  - lottery.engine.ts     → Draw resolution engine (internal)
 *  - dashboard.actions.ts  → User dashboard data fetching
 */

// Auth
export { registerUserAction, verifyCodeAction, resendVerificationCodeAction, forgotPasswordAction, resetPasswordAction, updatePasswordAction, updateUserAction, getLatestBalanceAction } from "./auth.actions";


// Lottery Rooms
export { getActiveRoomsAction, createPrivateRoomAction, buyTicketsAction, updatePrivateRoomAction, deletePrivateRoomAction, searchUserRoomsAction } from "./lottery.actions";

// Cloudinary
export { getSignatureAction } from "./cloudinary.actions";

// Admin
export { getAdminStatsAction, getAllUsersAction, updateUserRoleAction, getAllTransactionsAction, getCommissionsAction, getRecentActivityAction, createNewUserAction, updateUserDetailsAction, deleteUserAction, toggleUserBlockAction } from "./admin.actions";

// Finance
export { requestDepositAction, requestWithdrawalAction, getAllUserRequestsAction, processUserRequestAction, agentRequestRechargeAction, getAllAgentRechargeRequestsAction, processAgentRechargeAction, getUserPaymentRequestsAction, cancelPaymentRequestAction, searchAgentsAction, adminDirectRechargeAction } from "./finance.actions";

// User Dashboard
export { getUserDashboardDataAction } from "./dashboard.actions";

// Global Settings
export { getGlobalSettingsAction, updateGlobalSettingsAction } from "./settings.actions";
