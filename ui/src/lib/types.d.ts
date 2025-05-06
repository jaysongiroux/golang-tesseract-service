import { OCREngine, User } from "@prisma/client";

export type ExtendedUser = User & {
  randomKey: string;
};

export type OCRResponseList = {
  ocr_responses: OCRResponse[];
  engine: OCREngine;
  numberOfTokens: number;
};

export type OCRResponse = {
  text: string;
  confidence: number;
  bbox: BBox;
  pageNumber: number;
};

export type BBox = {
  topLeft: XY;
  BottomLeft: XY;
  topRight: XY;
  bottomRight: XY;
};

export type XY = {
  x: number;
  y: number;
};
