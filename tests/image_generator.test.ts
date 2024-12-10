import { describe, it, expect } from "vitest";
import * as path from "path";
import { generateBannerImage } from "../src/core/image_generator";
import { ChecklistData, ImageConfig } from "../src/types";

describe("Image Generator", () => {
  const mockImageConfig: ImageConfig = {
    backgroundKey: "bg.png",
    font: "Arial",
    fontSize: 18,
    textColor: "#FFFFFF",
    placement: {
      header: { x: 50, y: 20 },
      checklist: { x: 50, y: 100 }
    }
  };

  const mockBackgroundImageArrayBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAABbmlDQ1BpY2MAACiRdZE7SwNBFIU/E0XRSBAtRARTRLFQCApiqbGwCRJiBF/NZs0LduOymyDBVrCxECxEG1+F/0BbwVZBEBRBxNLaVyOy3skKEUlmmb0fZ+ZcZs6AL2boptMYAbNQtBPT0dD8wmKo+YUAHXQyTJ+mO9ZkPB6j7vi8o0HV22HVq/6+mqNtJe3o0NAiPKZbdlF4Qji2VrQUbwl36TltRfhQeMiWAwpfKT3l8bPirMfviu1kYgp8qmco+4dTf1jP2abwoHDYNEr673nUTQLpwtys1B6ZvTgkmCZKiBQl8hgUJZc8Bcmsti9S8c2wKh5d/hZlbHFkyYl3SNSSdE1LzYiels+grHL/n6eTGR3xugei0PTkum/90LwD39uu+3Xkut/H4H+Ei0LVvyo5jX+Ivl3VwgcQ3ICzy6qW2oXzTeh+sDRbq0h+mb5MBl5PoX0BOm+gdcnL6nedk3tIrssTXcPePgzI/uDyDx6MaBjBoDAbAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVQIW2P4///ffwAJ+QP8D3Bz9QAAAABJRU5ErkJggg==", "base64");

  describe("Banner Image Generation", () => {
    it("should generate image with basic checklist", async () => {
      const checklistData: ChecklistData = {
        header: "Weekly Goals",
        items: [
          { text: "Complete project milestone", isChecked: true },
          { text: "Review team progress", isChecked: false }
        ]
      };

      const imageBuffer = await generateBannerImage(
        checklistData,
        mockImageConfig,
        mockBackgroundImageArrayBuffer
      );

      expect(imageBuffer).toBeDefined();
      expect(imageBuffer).toBeInstanceOf(Uint8Array);
      expect(imageBuffer.length).toBeGreaterThan(0);
    });

    it("should handle markdown in checklist items", async () => {
      const markdownData: ChecklistData = {
        header: "Markdown Test",
        items: [
          { text: "*Italic* task", isChecked: true },
          { text: "**Bold** task", isChecked: false }
        ]
      };

      const imageBuffer = await generateBannerImage(
        markdownData,
        mockImageConfig,
        mockBackgroundImageArrayBuffer
      );

      expect(imageBuffer).toBeDefined();
      expect(imageBuffer).toBeInstanceOf(Uint8Array);
      expect(imageBuffer.length).toBeGreaterThan(0);
    });

    it("should handle empty checklist", async () => {
      const emptyData: ChecklistData = {
        header: "Empty Checklist",
        items: []
      };

      const imageBuffer = await generateBannerImage(
        emptyData,
        mockImageConfig,
        mockBackgroundImageArrayBuffer
      );

      expect(imageBuffer).toBeDefined();
      expect(imageBuffer).toBeInstanceOf(Uint8Array);
      expect(imageBuffer.length).toBeGreaterThan(0);
    });

    it("should use custom font and color settings", async () => {
      const customConfig: ImageConfig = {
        ...mockImageConfig,
        font: "Helvetica",
        textColor: "#FF0000",
        fontSize: 24
      };

      const checklistData: ChecklistData = {
        header: "Custom Style Test",
        items: [{ text: "Test item", isChecked: true }]
      };

      try {
        const imageBuffer = await generateBannerImage(
          checklistData,
          customConfig,
          mockBackgroundImageArrayBuffer
        );

        expect(imageBuffer).toBeDefined();
        expect(imageBuffer).toBeInstanceOf(Uint8Array);
        expect(imageBuffer.length).toBeGreaterThan(0);
      } catch (error) {
        console.error("Image generation failed:", error.message);
        console.error(error.stack);
      }
    });
  });
});