export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  CS = 'CS',
}

export enum CustomerRole {
  PLAYER = 'PLAYER',
  CAPTAIN = 'CAPTAIN',
  MANAGER = 'MANAGER',
  OFFICIAL = 'OFFICIAL',
  REFEREE = 'REFEREE',
  VENUE_OWNER = 'VENUE_OWNER',
}

export enum AccountType {
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum DominantFoot {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH',
}

export enum PlayerPosition {
  GK = 'GK',
  DF = 'DF',
  MF = 'MF',
  FW = 'FW',
}

export enum GameMode {
  SPARING = 'SPARING',
  FUNGAME = 'FUNGAME',
  TOURNAMENT = 'TOURNAMENT',
  KNOCKOUT = 'KNOCKOUT',
}

export enum MatchStatus {
  WAITING_ACCEPTANCE = 'WAITING_ACCEPTANCE',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
}

export enum MatchEventType {
  GOAL = 'GOAL',
  CARD = 'CARD',
}

export enum CardType {
  YELLOW = 'yellow',
  RED = 'red',
}

export enum TeamSide {
  HOME = 'home',
  AWAY = 'away',
}

export enum PassType {
  SAAS_MONTHLY = 'SAAS_MONTHLY',
  OTS_12H = 'OTS_12H',
  OTS_24H = 'OTS_24H',
}
export class ActivePass {
  type: PassType;
  activatedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}