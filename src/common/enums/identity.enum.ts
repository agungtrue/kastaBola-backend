export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  CS = 'CS',
}

export enum CustomerRole {
  PLAYER = 'PLAYER',
  MANAGER = 'MANAGER',
  OFFICIAL = 'OFFICIAL',
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
  SPARING = 'sparing',
  FUNGAME = 'fungame',
  TOURNAMENT = 'tournament',
  KNOCKOUT = 'knockout',
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