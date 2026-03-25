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
export { registerUserAction } from "./auth.actions";

// Lottery Rooms
export { getActiveRoomsAction, createPrivateRoomAction, buyTicketsAction } from "./lottery.actions";

// User Dashboard
export { getUserDashboardDataAction } from "./dashboard.actions";
