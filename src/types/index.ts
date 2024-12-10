export interface ChecklistItem {
  text: string;
  isChecked: boolean;
}

export interface ChecklistData {
  header: string;
  items: ChecklistItem[];
}

export interface ImageConfig {
  backgroundKey: string;
  font: string;
  fontSize: number;
  textColor: string;
  placement: {
    header: { x: number; y: number };
    checklist: { x: number; y: number };
  };
}

export interface PlatformPublishConfig {
  handle: string;
  appPassword: string;
}

export type PublishPlatform = "x" | "bluesky"; 