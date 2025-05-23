//in automation table
export interface Button {
  url: string;
  buttonText: string;
}

export interface Automation {
  _id: string;
  name: string;
  postIds: string[];
  keywords: string[];
  message: string;
  enableCommentAutomation: boolean;
  commentMessage: string[];
  isFollowed: boolean;
  createdAt: string;
  redirectCount: number;
  hitCount: number;
  isActive: boolean;
  messageType: "message" | "ButtonText" | "ButtonImage";
  buttonTitle?: string;
  buttons?: Button[];
  respondToAll?: boolean;
  permalinks?: Record<string, string>;
}
