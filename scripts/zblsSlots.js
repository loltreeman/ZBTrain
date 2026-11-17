// ZBLS algs for the other F2L slots (FL, BR, BL), by F2L case.
//
// Case numbers match ZBTrain's FR cases (zblsData.js): "FL 12-3" is F2L
// 12-3 with the FL slot turned to the front right (a y' rotation; BR is y,
// BL is y2). Every alg was checked with ZBTrain's alg checker to confirm
// which case and slot it solves.
//
// Sources (thank you!):
//   - ZB AlgSheet (FR, FL, BR and BL tabs):
//     https://docs.google.com/spreadsheets/d/1Zj06LtWcVXQjdeYEtmp6q69Z6eN_mDXtk9N9lD3gJRA
//     Its tabs credit algs to Twan (FL), ぷぇ～ / Puer (FL), BindeDSA,
//     Chad Batten and Tao Yu (FR), and others.
//   - masadl's FL algs for Tao Yu's Alg-Trainer (alg_list.js)
//   - FR / FL ZBLS lists from the ZB AlgSheet
// The BL tab only has a few cases so far. For the rest, ZBTrain uses
// "y2 + the FR alg" (see zblsSlotTools.js).
//
// Generated 2026-11-16. Coverage (cases with at least one alg):
//   FL 302/302, BR 302/302, BL 8/302
var zblsSlotAlgs = {
  FL: {
    "1": {
      "1": ["U2 F U' F'"],
      "2": ["U F' r U r'","F R U' R' U F'"],
      "3": ["U2 R' F R U' R' F' R","U2 F R U' R' F'"],
      "4": ["r' F' r' F r U' r","U2 r' U' F' U r","U2 r' F2 r F U' F'","U' F U2 R U R' U' F'"],
      "5": ["r F R' U R F' r'","r' F r U' F R U2 R' U F'","F U R U' R' U' R U' R' U2 F'","F r U' R' U R U r' U' F'"],
      "6": ["U2 F U' R U R' U' F'","U' F U' R U' R' F'","U2 L D R' F' R D' L'"],
      "7": ["U2 F R U2 R' U2 R U R' F'","U2 F R U2 R' F' r' F r","F R U' R' U R U R' U' F'"],
      "8": ["r' U2 R U R2 F' R U r","U R' F' R U2 M' U' M","U2 r' F r F U' R U R' U' F'","U2 r' F r U F U' R U' R' F'","U2 r' U' F' R U' R' U2 r"]
    },
    "2": {
      "1": ["L' U L"],
      "2": ["U r U' r' F","U L l' U' L' U l","F U' R U R' F'"],
      "3": ["F U R U R' F'","r' U' F U r","F R U2 R' U' F'"],
      "4": ["F R U R' F'"],
      "5": ["r' F' r U2 r U' r' F","U l' L U' L' U' L U L' U l"],
      "6": ["U' F' r U r2 F2 r","S r' F r S'","U M U' L' U L U M'"],
      "7": ["U' L' U L U L F' L' F","U L F' L2' U' L U F","U F R U R' U' F' U r' F' r"],
      "8": ["U' F R U2 R' F' r' F2 r","U' F R U' B U2 B' R' F'","U' L F' L' F U2 L F' L' F"]
    },
    "3": {
      "1": ["U L' U' L"],
      "2": ["r' R U r' F' r2 R'","r' R U' R' F R U R' F' r","U r' F' r F R U R' U' F'","U r' F2 r U r U' r' F","U' F R U' R' U2 R U R' U' F'","f R U' R' U2 R U' R' f'"],
      "3": ["U2 F U2 F' U' r' F r","U F U' R' F' r U' r' F2 R F'","U' F U R U R' U' R U' R' U F'","U' R' F R U S R' F' R S'","F U R U' R' F' r U' r' F","U L' U' L U' F U R U' R' F'"],
      "4": ["U' R' F R U R' F' R","U L' U L U2 L F' L' F"],
      "5": ["U r' F r U F R U R' F'","U r' F' U' F' U F r","U S r' F' r S'","U2 R r' U' L' U' L U M'"],
      "6": ["F' U' r' F r2 U r'","U r' F2 r F R U2 R' U' F'","U r' F2 r F U R U R' F'","f R U' R' U R U R' U' f'","U' r' F r F U' R U' R' U F'","U L' U2 B' U B L"],
      "7": ["U r' F' U' R U' R' U2 r","U r' F2 r F R U R' F'","U r' F' U' R' F R F' U r","U r' F r U r' U' F U r","U F U' R U2' R2' F R F2'","U L' U L2 F' L' F L' U2 L"],
      "8": ["F U R U' R' F' U' F R U R' F'","U F R U R' U2 R U' R' F' r' F' r","F U R U B U' B' U' R' U F'","U r F R' U R F' r2 F' r","U L D R' F' R D' L2 U' L"]
    },
    "4": {
      "1": ["U F U F'"],
      "2": ["r' F2 r F' r U r'","U' F U R U2 R' F'","U S' U' r' F r S","l L2 U L U' M'"],
      "3": ["r' F2 r U F U' F'","U F U R U' R' F' r' F r","U F U F' U' F U R U' R' F'"],
      "4": ["F U' R U2 R' U R U' R' U2 F'","r' U' R' F R F U r","U' F U' R U B U' B' R' F'","F U' R U R' U2 R U2 R' U2 F'","U F U S R U R' U' f'","U F U F' U2 F U R U' R' F'"],
      "5": ["U F U R U R' U' F'"],
      "6": ["U F U2 R U' R' F'"],
      "7": ["U' F U R U' R' U' F'"],
      "8": ["U r' F r U' F R U R' U F'","U r' F' r U F U' R U2 R' F'"]
    },
    "5": {
      "1": ["F U R U' R' U2 R U' R' F'","U F R U2 R' U' R U' R' U' F'","U' F R U R' U2 R U R' U' F'","r' U r' F' r2 U r' F' r","F U R' D' R U R' D R F'","F R U' R' U' R U2 R' U2 F'"],
      "2": ["r' U r U r' F' U' r","U2 F R U R' U' F' r' F2 r","F R U2 R' U' R U2 R' U F'","U R f U' R' U R f' R'","F U2 R U' R' U' R U' R' U2 F'","U' L F U F' U' L2 U L"],
      "3": ["U' F R U R' U' R U' R' F'","U2 F R U' R' U F' U' r' F' r","U2 l' U L U' L' U' l","U' F' r U r' U2 r' F' r"],
      "4": ["U F R U2 R' U' R U2 R' F'","F R B U' B' R' U2 F'"],
      "5": ["F U R U' R' U F'"],
      "6": ["F U R U' R' U R U R' U' F'","F U' R U R' U R U R' U F'","U' F r U R' U' r' R U' F'"],
      "7": ["U' F R U R' U2 F'"],
      "8": ["r' F r F R U2 R' U F'"]
    },
    "6": {
      "1": ["U2 L' U' L U2 L' U L"],
      "2": ["U' F R U2 R' U R U2 R' F'","U F' U' F r U' r' U F","U2 F R' F' U' F U R F'"],
      "3": ["U F U r U' r' U2 r U r' F'","U' F U2 R U R' U2 R U2 R' F'","F R U r' R' F' r U r U' r'","R' U' R F R' U R2 U R' F'","U2 F R U' R2 F R F' R' F R F2","F R U R' r U' r' U' r U r' F'","U' F R' D' R U R' D R2 U R' F'","U' L F' L' f L' U2 L S'"],
      "4": ["U2 r' F' r U2 F R U R' F'","F R U R' U' F' r U' r' F","F R U' R' U' F R' F' R F'","U' F R U2 R' U R U' R' U' F'","U F U' F' L' U L U L' U' L"],
      "5": ["U2 L' U' L U' L F' L' F","U2 r' F' U' F U F' r"],
      "6": ["U F U r U' R' U2 R U r' F'","U r' F r U F R U' R' U R U2 R' U F'","U2 r' F r F U R U2 R' U R U2 R' F'","U2 l' U' L U l L2' U2 L"],
      "7": ["U R' F' U' F U R U2 r' F r","F R U' R' U' F' r' F2 r","U2 r' F' r U2 F U R U R' F'","U' r' U' F' U r U r' F r","F R U R' U' F' U' L' U L","U' r' U' F' U F2 r"],
      "8": ["U2 R' F R U2 R' F' R r' F2 r","F R U R' U F' U' r' F' r","R' U' F' U F2 R U R' F' R","U2 R' F R2 U2 R' F r U2 r'"]
    },
    "7": {
      "1": ["F U2 R U' R' U2 R U' R' F'","U F U R U2 R' U R U R' U' F'","U2 F U R U2 R' U' R U' R' F'","U2 l' U' l U' l' U l U l' U l"],
      "2": ["U F U R U2 R' U F'"],
      "3": ["U2 F U R U2' R' U2 F'"],
      "4": ["F r U' r' U r U r' U' F'","F R U R' U R U R' U F'","F U2 R U' R' U R U R' U' F'"],
      "5": ["F U2 R U' R' U F'"],
      "6": ["F U' R U' R' U' R U' R' U2 F'","U F U2 R U2 R' U R U' R' U F'","F U R U2 R' U' R U2 R' U F'"],
      "7": ["r' F' r F R U R' U2 F'","U F U R U2 R' U2 R U' R' F'","U2 F U R U2 R' U2 R U R' U' F'","U2 F U2' R U R' U R U' R' U F'"],
      "8": ["r' F' r U F U R U' R' U F'","U R' F' R U L' U L R' F' R","U2 r' F r U F R U R' U2 F'"]
    },
    "8": {
      "1": ["U2 L' U2' L U2' L' U L"],
      "2": ["U R' F' U' F2 U F' R","U L' U' L U' L' U L2 F' L' F","U F R U2 R' U' F' r' F' r","U2 F U R U2 R' U R U' R' U' F'"],
      "3": ["r' F' r U' F U2 R U2 R' F'","U2 r' F2 r U2 F U R U R' F'","U2 r' F r F U2 R U' R' U' F'","U2 r' F2 r U2 F R U2 R' U' F'","U2 r' U' R U' R' U F U r","U2 F R U' R' F R' F' R U2 F'","R' D R U2 R' D' R U r U' r' F","U' r U r' R U R' U' r U2 r' F","L' U' B' U2 B U2 L"],
      "4": ["U2 F U R U2 R' U R U2 R' F'"],
      "5": ["U2 L' U2 L U' L F' L' F"],
      "6": ["F U' R U R' U F' U' r' F' r","r' F' R U' r' F r U R' F2 r","U F' L F L' U2 L' U L U' L' U L"],
      "7": ["U2 r' U' R U' R' U2 F r","U2 r' F2 r U2 F R U R' F'","U2 r' F r F U2 R U2 R' F'","U' R' U' F' U F R r' F r","r' F' r U' F U2 R U' R' U' F'"],
      "8": ["F U' R U R' U' F' U' r' F r","F U' R U' R' U' F' r' F2 r","U M' U M U2' R' F R","U l' U l L' U' L U' l' U l","U F R U R' U R' F R F' U F'"]
    },
    "9": {
      "1": ["U2 L' U' L U' L' U' L","U' L' U L U L' U' L","U F U' R U R2 F R F2"],
      "2": ["r' F' r U F U' R U' R' U F'","U2 r' F r U2 F U' R U' R' U F'","U2 F U2 R U R' U' R U' R' U F'","U' F R B U B' U' R' U F'","U' L' U L F' U' L' U L2 F L'","F R U' R' F' r U' r' F"],
      "3": ["U2 F U R U' R' U2 F'","U' l' U L U L' U' l","F' r U r' U' r U' r' F","F U' F' U L' U' L","U' L' U l U L' U' L M'"],
      "4": ["U2 F U R U' R' U' R U' R' F'","U2 F U' R U R' U R U R' U2 F'","U2 F R U' R' U' R U R' U R U' R' U F'"],
      "5": ["F' r U r' U2 r' F r","F R U R' U2 R' F R F2","F R U' R' F' U' L' U L"],
      "6": ["U' r' F r U' R' F R U R' F' R","r' F' r U' F U R U R' U2 F'","U2 L' U' l U' L' U' L U M'"],
      "7": ["U2 r' F' r U R' F R U R' F' R","U F U' R U' R' U F' r' F' r","F R U B U' B' U' R' U F'","U' L' U L U S L' U' L S'"],
      "8": ["F U R U R' U' F' r' F' r","U' l' U l U2 l' L U' L' U' l","U' F U2 r U' R' U2 R U r' F'"]
    },
    "10": {
      "1": ["U2 F R U' R' U' R U2 R' F'","U2 F U R U R' U R U2 R' F'","r' F' r F U R U2 R' F'"],
      "2": ["R' F' U' F U R r' F2 r","U F U' R U R' U' R U2 R' F' r' F r","U F U' R U R' U2 R U' R' F' r' F r","F U R' F R F' R U2 R' F'"],
      "3": ["r' F' r U2 F U F'","U2 L' U L U' F U F'","r' F' U' F U r U r' F r","L' U' B' U B U2 L"],
      "4": ["F U R U R' U2 R U' R' U2 F'","U2 r' F r U F U R U2 R' F'","l' U' L U l L2' U L"],
      "5": ["U F U' R U R' U2 F'"],
      "6": ["R' F R U2 R' F' R r' F r","U2 F R U' R' U' R U' R' U' F'","U2 F U R U R' U R U' R' U' F'","U2 r' F r U F U R U' R' U' F'","r' F' r F U R U' R' U' F'"],
      "7": ["U F U' R U R' U' R U' R' F'","F R U2 R' U R U' R' U2 F'"],
      "8": ["U2 r' F r U' F U2 R U' R' F'","r' F' r U2 F U R U R' U' F'","R' F' R U2 M' U' M r' F r"]
    },
    "11": {
      "1": ["U L' U L U' L' U L U2' L' U L","L' U L U L' U' L U L' U' L","U F U2 R U' R' U R U R' U F'","U F U R U R' U' R U2 R' U F'","U L U2 L2 U' L2 U' L'"],
      "2": ["U F U R U' R' U R U' R' U F'","F U R' F R F' U2 R U' R' F'"],
      "3": ["U L' U L U' L' U L U' L F' L' F","U F R U R' U' R U R' U' R U2 R' F'","F U' R U' R' F' r U' r' F"],
      "4": ["F U R' F R F' U F'","F U2 F' U r' F' r","U F U R U2 R' U' R U2 R' U2 F'"],
      "5": ["r' F r F R U' R' U R U' R' U F'","F R U R' U' F' r' F' r","U r' F r U' F U2 R U2 R' F'","U L' U B' U2 B U2 L"],
      "6": ["U' r U2 R' U' R U' r2 F' r"],
      "7": ["F' L F L2' U' L U2' L' U L","U r' F r U' F U2 R U' R' U' F'","F U' R U' R' F' U' F R U R' F'","r' F2 r U2 F U' R U R' U F'","F' r U r2 F' r U r' F2 r"],
      "8": ["F U' R U' R' F' U' r' F r","U r' F2 r U M' U M U2 R' F R","F U' R U R' U2 R' F R F2"]
    },
    "12": {
      "1": ["U F U' R U2 R' U' R U' R' F'","U F R' D' R U2 R' D R U F'","U L' U2 L U F R U' R' U' F'","U2 L' U2 L U F U R U2 R' F'"],
      "2": ["r' F2 r F U R U2 R' U F'","F' r U r' F U' R U2 R' U F'","U2 L' U' L U L' U L U F U F'","U L' U' L U' r U' r' F r U' r' F"],
      "3": ["U F R' D' r U2 r' D R U F'","U r' F' r U r' F r F U F'","U F U' F' U F U' R U' R' U F'","U F U' R U2 R' U' R U2 R' F' r' F r","F' r U r' F R U2 R' U R U' R' U F'","U F U' R U2 R' U2 R U' R' F' r' F r","U F' L F L' U L' U L U' L' U L","U F R U R' U R U' R' U R U R' U' F'","U F R U R' U' R U R' U R U R' U F'"],
      "4": ["U2 r' F2 r U' F U F'","U2 r' F' R U r' F' M' F' r"],
      "5": ["U F U' R U2 R' U2 F'","U' F U R U' R' U R U' R' U2 F'"],
      "6": ["U r' F2 r U F R U2 R' F'","U r' F2 r U R' F R U2 R' F' R","U F R U B U' B' R' U2 F'"],
      "7": ["U F R U R' U R U' R' U F'"],
      "8": ["U r' F r F U2 R U2 R' U F'","U r' F2 r U2 F R U R' U F'","F' r U r' U F U' R U R' U F'","U r' F r U' F U R' F R F2","U r' F' r U2 F U' R U' R' U' F'","U' L' U' L U' F U2 R U' R' U F'","U2 L' U2 L U' F U R U R' U' F'"]
    },
    "13": {
      "1": ["F U' R U' R' U' R U R' U2 F'","U2 L' U L U' L' U' L"],
      "2": ["F U R U' R' U' R U R' U2 F'","U2 r U' r2 F' r U r U r'"],
      "3": ["F R U' R' U' R U R' U2 F'","U2 r' F R U' r' F' r U M'","U' F U R U' R' U R' F R F2"],
      "4": ["F U2 R U' R' U' R U R' U2 F'","U' L' U' L U' L' U2' L2' F' L' F","U2 r' F2 r F U R U' R' U2 F'","R' F U' F' U R U r' F' r","U' M' U' L' U l U' L' U' L"],
      "5": ["U F U' R U' R2' F R F2'","U r' F' r U' F U2 R U' R' U2 F'","U f R U2 R' U' R U2 R' f'"],
      "6": ["U' R' U' F U r U2 r' F' R","r' F' U' F U r U2 r' F' r","U r' U' R U' R' U2 F2 r","U2 R' U' F' U F R r' F' r","U l L' U L' U L U' L' U' L M'"],
      "7": ["U2 r' F r U R' F R U R' F' R","U F U R U' R' F' U r' F' r","U F U' R U R' U F' r' F' r"],
      "8": ["U' l' U l U' l' L U2 L' U' l","U' R' F R U2 R' F' R U' r' F' r","U' R' F R U r' F2 r R' F R","r' U' R' F R F' R' F R U r"]
    },
    "14": {
      "1": ["F R U R' U2 R U R' U2 F'","U2 F R U R' U R U2 R' U F'","U' F U' R U R' U R U2 R' U F'","F U' R U2 R' U R U R' U2 F'"],
      "2": ["r' F r U' F U2 R U R' U2 F'","r' F' R U' r' F' r U R' F2 r","U F U2 R U R' U' F' r' F2 r","U L' U' L U L F' L' F U' L' U L","F U R2 D r' U r D' R2 F'","U' F R U' R' f R' F' R f'","U' F U R U' R' U R U2 R' U2 F'"],
      "3": ["F' r U2 R' U R U2 r2 F r","U l' L U L' U' L U2 L' U l","U L' U L U' L F' L' F L' U L","U L' U' L U' L' U L F U F'","F U' R U2 R' U R U R' U' R U' R' F'"],
      "4": ["U2 F U R U' R' U R U2 R' F'","U l' L U L' U' L U L' U2 l","F' r U r' F R U R' U F'"],
      "5": ["U2 F U R U' R' U R U' R' U' F'"],
      "6": ["U F R U R' U F' U r' F' r","U r' F' r F U' R U2 R' F'","U' F R U' R' U R U2 R' F'"],
      "7": ["U F U2 R U' R' U F' U' r' F' r","U r' F' r F U' R U' R' U' F'","U' F R U' R' U R U' R' U' F'"],
      "8": ["U r' F r F R U' R2' F R F2'","U r' F2 r U' F U2 R U2 R' U F'","R U R' U' R' F2 R F' R U2 R' F'","F' r U r' U F R' F R F2","F U R U2 r R2 U R U' r' U2 F'"]
    },
    "15": {
      "1": ["U F R U' R' U2 R U' R' U' F'","U F U R U' R' U2 R U' R' U F'","U' F U R' D' R U' R' D R U F'","U l' U' l U' l' U2 l U l' U l","M' U' L' U l U L' U' L"],
      "2": ["U F R B U' B' R' F'","U r' F r F U R U2 R' F'","r' F2 r F R U' R' U' F'","U' R' F' U' F U R r' F r"],
      "3": ["U F U2 R U R' U F'","U L' U L U2 F U F'"],
      "4": ["U' F U R U R' U2 R U' R' U F'","U2 r' F r F U R U2 R' U2 F'","r' F2 U2 R U R' U F2 r","U r2 F r U' r U2 r' F r"],
      "5": ["U F U2 R U R' U R U R' U' F'","U2 r' F2 r U F R U R' U2 F'","r' F2 r U F R U R' U F'"],
      "6": ["R' F R U2 R' F' R U r' F' r","U F U R' F R F' U2 F'","U F R B U' B' U R' U' F'","U2 F U2 R U R' U2 R U' R' U F'"],
      "7": ["U F R U' R' U2 R U2 R' F'","U' r' F' r F R U2 R' F'","U F U2 R U R' U2 R U' R' F'","U' L' U' L R' F R U2 R' F' R"],
      "8": ["r' F2 r F R U2 R' F'","r' F2 r R' F R U2 R' F' R","U2 l' U L U L' l U2 l' U' l","U F R B U2 B' U R' F'","U F U R f R2 f' R' U2 F'","U2 F r U' R' U2 R U r' U2 F'","U' r' F' r U F R U R' U F'","U r' F r F U R U' R' U' F'"]
    },
    "16": {
      "1": ["U F R U R' U' R U' R' U F'","U L' U' L U2 L' U L U' L' U L"],
      "2": ["U r' U' R' F R U r","U M U' R' F R U M'","U F U' R U' R' U2 R U R' U' F'"],
      "3": ["U F U' R U' R' U2 F'","r U' r' F U' r' F' r"],
      "4": ["U F U' R U' R' U' R U' R' F'","U F U R U R' U R U R' U2 F'","U r' F2 r U' r' U r' F' r2","U F U r U' r' U r U r' F'","U F U' F' R' F R U R' F' R","L' U' L U2 r' U' R' F R U r"],
      "5": ["F U2 R U' R' U' F' r' F2 r","U L' U' L U2' L' U L2' F' L' F","F' r' F r U2 r' F' r2 U r'"],
      "6": ["U' r' F r U r' U' R' F R U r","U r' F r F U' R U R' U F'","U r' U' R' F R F R' F' R U r"],
      "7": ["U' r U R' U R U2 r2 F' r","U r' U' R' F R U' R U R' U r","U' F U R U' R' F' U' r' F' r","U l L' U' L' U' L U l' U L","U' F U R U' B U' B' R' U' F'","S L' U' L S' L' U2 L"],
      "8": ["U r' U' R' F R2 U' R' U2 r","U r' U' R' F2 R F' U r","U2 F U' R U2 R' F' r' F' r","F R U2 R' F' U' r' F' r","F R U2 B U' B' R' U' F'"]
    },
    "17": {
      "1": ["U L F' L' F L' U L U' L' U L","U r' F' r F R U2 R' U2 R U' R' F'","U' F U R U2 R' U' R U' R' U' F'","U F R B U' B' U2 R' U F'","F R U R' U' R U R' U' R U R' F'","F R U R' U' R U2 R' U R U' R' F'"],
      "2": ["U' F U' R U R' U' R U R' U2 F'","r' F r2 U' r' F r U' r' F"],
      "3": ["F R U R' U' R U' R' U' F'","L' U L2 F' L' F U' L' U L"],
      "4": ["U2 F U' R U2 R' U' R U R' U2 F'","F U' R U' B U2 B' U R' F'","U R' U' F' U F R U' r' F' r","U L F' L' F L' U L2 F' L' F"],
      "5": ["U2 F R U R' U' R U R' U2 F'","U r' F2 r F U R U' R' U F'"],
      "6": ["F U' R U' R' U2 R U R' U F'","U r' F2 r U' F R U R' U2 F'","U2 F U R U2 R' U' R U R' U F'","U' r' F2 r U' F U' R U2 R' F'","F R U R' U' R U R' U2 R U R' F'"],
      "7": ["F R U R' U' R U2 R' F'","U r' F' r F R U2 R' U F'"],
      "8": ["r' F r U' F U' R U2 R' F'","F U' R U' B U' B' R' F'","U r' F' r U' F U R U R' U F'","F U' F R' F' R2 U2 R' F'"]
    },
    "18": {
      "1": ["U L' U2' L U L' U' L"],
      "2": ["F U' R U' R' U R U2 R' U F'","U r' F2 r U' R' F R U R' F' R","U' L' U' L U L' U' L U' L F' L' F"],
      "3": ["F U2 R U' R' U R U2 R' U F'","F R U' R' U R U2 R' U2 R U' R' F'","U' R' F R U' L' U' L U' R' F R"],
      "4": ["F R U' R' U R U2 R' U F'","U L' U2 L U S L' U' L S'"],
      "5": ["U' r' F r F R U' R' U R U2 R' U F'","U2 r' F' r U F U' R U R' U F'","L' U2 L U L' U' L U' L F' L' F","U2 F' U' L' U2 L U L' U' L2 F L'"],
      "6": ["U' F U' R U2 R' U F' U r' F' r","U' F U' R U2 R2 F R F' U F'","U2 L' U2 L U L' U' L2 F' L' F","U L' U2 L F' U' L' U L2 F L'"],
      "7": ["U r' F r U' F U R U' R' U2 F'","U2 F U' R U' R2 F R F' U F'","U' r' U2 R U R' U r U' r' F r","U2 F' r U r' U' r' F r U r' F' r","U L' U L l' U L U L' U' l","U L' U2 l U L' U' L M'"],
      "8": ["U' F U2 R U' R' U F' U r' F' r","U' F U2 R U' R2' F R F' U F'","U2 F R U2 R' U F' U r' F' r","U2 F R U2 R2 F R F' U F'","U2 r' F2 U2 R U R' F U r"]
    },
    "19": {
      "1": ["U' F U2 R U2 R' U R U R' U' F'","U F U2 R U R' U R U2 R' U F'","f R U2 R' U2 R U2 R' f'"],
      "2": ["F U R U R' U' R U2 R' F'","F R U2 R' U2 R U' R' U' F'"],
      "3": ["U' r' F r U F R U' R' U' F'","U2 r' F' r U' F R U' R' U' F'","U F U' R U' R' U R U' R' U' F'","r' F r F U' R U R' U' R U R' F'"],
      "4": ["U' F U' R U2 R' U R U' R' U F'","f U R U R' U' R U2 R' f'"],
      "5": ["r' F r F U' R U2 R' F'","F R U2 R' U2 R U2 R' F'","F U R U R' U' R U' R' U' F'","U F U R U2' R' U R U2' R' U F'","U F R U' R' U R U2 R' U2 F'"],
      "6": ["U F U' R U' R' U R U2 R' F'","U2 F U' R U' R' U' F' U r' F' r","U r' F' r U F R U2 R' U F'"],
      "7": ["U' F U2 R U2 R' U F'","F R U' R' U2 R U R' U F'","U' F R U' R' U' R U R' U F'","U2 F U R' F R F2"],
      "8": ["r' F r F U' R U' R' U' F'","U' r' F r U F R U2 R' F'","F R U' B U' B' R' F'","U2 L' U' L U' F R U2 R' F'"]
    },
    "20": {
      "1": ["L' U2 L U' L' U L"],
      "2": ["r' F2 r U' F R U R' F'","U' r' U2 R U R2 F R U r","U2 r' F U2 R U R' U F r","R2 D' R U' R' D F R U F' R","U F U R' F R F' R' F R F2'","U' R U R2 U' R' F R U R F'","L' U' L U r' U' F' U F' r"],
      "3": ["U' F R U R' U' R U R' U F'","U' F U' R U' R' U R U R' U F'","R' F2 r U' r' F r U' r' R","L' U2 l U' L' U L U M'"],
      "4": ["U' F U2 R U' R' U R U' R' U F'","U' F U' R U2 R' U2 R U' R' U F'"],
      "5": ["r' F2 r U' F U R U R' F'","r' F2 r U' F R U2 R' U' F'","F U' R U R' U F' U2 r' F r","r' F2 r U' r' U' F U r"],
      "6": ["F U' R U2 R' U F' r' F2 r","U2 F U R U' R2' F R F2'","U2 F R U' R' U' F' r' F' r"],
      "7": ["U2 F R U2 R' U2 F' U r' F' r","r' F2 r U' F U' R U R' F'","U2 R' F R U r' F' r U' R' F R","L' U2 L2 F' L' F"],
      "8": ["F U' R U R' U2 F' r' F2 r","U2 r' U' F R' F R U r","F U' R U' R' U' R' F R F2'","F U' R U' R' F2 r U r'","U2 r' F U2 R U R' F U r","F U' R U2 R' F' U2 r' F r","r' F' r F R U2 R2 F R F2"]
    },
    "21": {
      "1": ["R U2 F U F' U R'","U F R U R' U2 R U R' F'","U F U' f R' F' R f'","U' f R' F R F' f'","U' r U R' U R U r' F","U F R U R' F' r' F r"],
      "2": ["U F R U' R' U' F'","U F R U R' U R U R' F'"],
      "3": ["U' F R' F R F2'","F U R U' R' U2 R U R' U F'","U' F U R U' R' F' U2 r' F r","U' F R B U' B' R' U F'"],
      "4": ["U2 F R U R' U R U R' U' F'","U2 r U R' U R U2 r2 F r"],
      "5": ["U F R U2 R' F'","U R' F R U2 R' F' R"],
      "6": ["U2 F R U R' U F'"],
      "7": ["U F R U R' U' R U R' F'","U2 F R U R' U2 R U' R' F'","U F R U2 R' U R U' R' F'"],
      "8": ["F U R U' B U' B' R' F'","U F R U' R2' F R F' U' F'","U F R U2 R' U R' F R F' U' F'","r' F2 r F U' R U2 R' U2 F'","U' r' F' r U2 F U R U' R' U' F'"]
    },
    "22": {
      "1": ["U r' F r F R U' R' U2 F'","U' R' U r' F' r R","U' L' U' L U' L' U L","U L' U L U2 L' U' L"],
      "2": ["r' F' r F U' R U R' U F'","U2 F R U' R' U R U R' U F'","U2 r' F r U F U' R U R' U F'","U r' U' F U F r"],
      "3": ["U' r' F' r U' F U' R U R' F'","U' r' U r' F' r2","U' L' U' L2 F' L' F"],
      "4": ["U2 r' F r F U' R U2 R' U F'","U' F U' R U R' F' r U' r' F","r U' r' F U' r U' r' F","L' U L U2' L' U L2 F' L' F"],
      "5": ["U R' F r U2 r' F' R","U' r' F' r U' F U R U R' F'","U F R U' R' F' U' r' F' r","U F U R U2 R' F' r' F' r","U r' U' F2 U r"],
      "6": ["U' r' F' r U' F R U R' F'","r' F2 r F U' R U' R' U2 F'","r' U' F' U F' r","U f' U' L' U L f L' U L","r' U' R U' R' U F' U r"],
      "7": ["F U2 R U R' U F' U r' F2 r","r' F' r U' F U' R U2 R' U F'","r U' r' F U2 F R U R' F'","F' L F L' L' U L U' L' U' L","U' L' U' l U' L' U L U M'"],
      "8": ["F U2 R U2 R' U F' r' F2 r","U' F R U2 R2 F R F2'","U2 r' U2 R U R' F U r","U r' U' F2 R U' R' U2 r","U' F R U2 B U' B' R' U F'"]
    },
    "23": {
      "1": ["U F U' R U R' U R U2 R' F'","U' F R' U' R U' R' U2 R F'"],
      "2": ["U L' U L U' l' U L U' L' U' l","U2 F R U R' U' R U' R' U2 F'"],
      "3": ["U' F U2 R U' R' U' R U' R' U F'","F R U' R' F' r' F' r"],
      "4": ["F U R U' R' F' r' F' r","U F U' R U R' U R U' R' U' F'","U F U2 R U' R' U' R U' R' U' F'","U' r' U' R U' R' U2 F' r","U2 L' U L U' F R U' R' U' F'"],
      "5": ["U r' F r F R U R' U2 F'","F U2 R U' R' F' r' F' r","U2 r' F r U' F R U2 R' F'","r' F2 r F U' R U R' U2 F'","U2 r' F r U' R' F R U2 R' F' R","U F R U' R' U R U R' U' R U' R' F'"],
      "6": ["U F R U' R' U R U R' U2 F'","U' r' F' r F U' R U R' U2 F'","U r' F' r U F U R U R' U F'"],
      "7": ["U' F U' R U R' U' R U' R' U2 F'","U2 F U' R U' R' U' R U' R' U F'","F U' R U' R' F' r' F' r","U2 r' F r F R U R' U F'"],
      "8": ["U r' F2 r F U2 R U' R' U F'","U r' F' r U2 F R U2 R' U F'","U2 r' F r F R U R' U2 R U' R' F'","U F R U' B U B' U' R' F'"]
    },
    "24": {
      "1": ["L' U L U L' U L U' L' U L","U F U R U R' U2 R U' R' U' F'"],
      "2": ["U' R' F R U' R' F' r U' r' F R","U F U R U R' U2 R U2 R' F'"],
      "3": ["U F U' R U2 R' U R U2 R' F'","L' U L U L' U L2 F' L' F","F U r U' r' U2 r U r' U F'"],
      "4": ["U F U R U2 R' U2 R U R' U F'","U r' F r U' F U R U R' U2 F'","U' F R U R2' F R F2'","r' F2 r U F U2 R U2 R' F'"],
      "5": ["F' r U r' U' r' F' r","F U R U R' U2 F' r' F2 r","U' F R U' R' U F' r' F' r","U' r' F' r U F U2 R U2 R' F'"],
      "6": ["U r' F r F R U2 R' U2 F'","U L' U2 L U' l' U L U L' U' l","F U R U2 R' U F' r' F2 r","F U r U' R' U2 R U r' U F'","U r' U' F' U r U' r' F' r","F U R f R2 f' R' U F'"],
      "7": ["r' F2 R U' R' F' R U R' F r","U M U2 r' F' r U' R' F r","U r' F r U F U' R U' R' U F'","U' r' F' r U F U2 R U' R' U' F'","U' R' F R U' R' F' R U' r' F r","U' R' F' r U r' R U2 r' F r"],
      "8": ["F U R U R' U F' U r' F2 r","U2 F U R U' R' U F' r' F' r","U2 F R B U B' U R' U F'","U l' U l U' l' L U L' l U2 l' U' l"]
    },
    "25": {
      "1": ["U' F R U R' U R U2 R' U2 F'","f' U2 R' F' R U2 f","U F U' R' D' R U' R' D R U F'","U2 L' U L U l' U L U' L' U' l"],
      "2": ["U' r' F r F' r U r'","U r' F2 r U2 F U F'"],
      "3": ["U' r' F r U F U' F'","U' F U2 R U R' U2 F'","R' D' F' r U r' D R","F' U2 R' F' R U2 F"],
      "4": ["U' r' F' r U F U F'","F r R' U R U' r' F'","F r U' R' U' R U r' F'"],
      "5": ["U2' F U2 R U2 R' U2 F'","U2 F R U R' U R U' R' U2 F'"],
      "6": ["R' F' R U2 R' F r U2 r' F R","F U R U' R' U F' U' r' F' r","F U r U' r' U2 r U r' U2 F'","U2 F' U2 R' F2 R U2 F","U R' F2 U' F U F2 R"],
      "7": ["F U R U R' U' F' r' F2 r","F U R U' R' U' F' U' r' F r","U' F U2 R U R' U' R U' R' F'","U F U' R U R' U2 R U' R' U F'","R' F2 U' F' U F2 R"],
      "8": ["U2 r' F r U' F U R U' R' U F'","R' F2 r U' r' F R U2 R' F R","U' r' F' r U F U2 R U' R' F'","U F U' R U2 R2 F R F' U2 F'","F r R' U' R r' U2 r U' r' F'","U2 R' F' R U2 r R' U r' F2 R"]
    },
    "26": {
      "1": ["r U r' U' r' F r F'","U' F R U R' U R U R' U2 F'","U2 F r U' r' U2 r U r' F'","r' D' r U' r' F D r","U F r' F' r U r U' r'"],
      "2": ["U' F U2 R U' R' U2 F'","U r U' r' F r' F' r","U F U' F' r U' r' F"],
      "3": ["F r U' R' U R U r' F'","U F U' F' U' r' F r","U F U' F' U2 r' F2 r","R' D' r U' r' F D R"],
      "4": ["U F U F' U' r' F' r","F' U2 R' F R U2 F","U2 F r U R' U' r' R F'","U' R' U' F' R' F R F U R"],
      "5": ["U' r' F r U F U R U R' U2 F'","R' F' R U2 R' F' r U2 r' F R","U f r U' r' U' r U r' f'","U f U R B U' B' U' R' f'","U' F R U R D r' U' r D' R2 F'","r U r' U R U' R' U' r' F r F'","r U r' U' r' F r U R U' R' F'"],
      "6": ["U' f U2 R U' R' U2 f'","U2 F r U' R' U2 R U r' F'","U2 R' F2 r U' r' F r U2 r' F R","U' f r U' r' U r U r' f'"],
      "7": ["f U2 R U R' U2 f'","U2 R' F R r' F r U R' F R","U' R' F' R U' L' U' L R' F' R"],
      "8": ["R' F' R U2 R' F' r U r' F2 R","l' U2 L U' L' l U2' l' U l","U2 F R U R' U2 F' U' r' F r","U2 F U2 R U' R' U F' U' r' F r","U F U' R U R' U' F' U r' F' r","U L F' L' F L' U2 L U L F' L' F"]
    },
    "27": {
      "1": ["r' F' r U F' r U r'","r' F' r F R U' R' U F'","r' F2 r U F R U' R' U F'","U' F R U2 R' U R U R' U' F'"],
      "2": ["r' F' r U2 F U' F'","r' F' r U' F U2 F'"],
      "3": ["r' F2 r' F r U' r","r' F2 r U' F R U' R' F'","F U R U2 R' F' U r' F' r","U' F R U2 R' U2 R U' R' F'","r' R U' R' F' R U R' F' r"],
      "4": ["r' F2 r F U2 F'","r' F2 r U' F U' F'","r' F' r U' r2 F r U' r"],
      "5": ["U' F R U2 R' U F'","F U2 R' F R F2","F U' F2 r U r'"],
      "6": ["U2 F U R U R' U F'"],
      "7": ["U F R U' R' U' R U' R' U F'","F U2 R U2 R' U F' r' F' r","U' r' F' r F U R U' R' U F'","F R B U' B' U' R' U F'","U' F U R U2 R' U R U' R' U F'"],
      "8": ["r' F' r U' F U' R U' R' F'","r' F2 r F U' R U' R' F'","U r' F2 r F R U R' U2 F'","U' R' F' R U2 M' U' M r' F' r","r' F2 U' R' F2 R U r"]
    },
    "28": {
      "1": ["L' U L U' L' U L"],
      "2": ["F U F' U2 r' F r","F U F' U r' F2 r","F U R U' R' U2 F' r' F2 r","F U R U' R' U2 F' U r' F r","L' U L2 F' L2 U' L U F"],
      "3": ["r' F r U' F U R U R' F'","U' F R U R' U2 R U2 R' F'","r' F r U' F R U2 R' U' F'","L' U L U' L' B' U B L"],
      "4": ["F U2 F' r' F2 r","F U2 F' U r' F r","F R U R' F' U2 r' F r","F R U R' F' U r' F2 r","U2 r' F U' R' F R U r","U' F R U R' U2 R U' R' U' F'","L' U l U' L' U L U M'"],
      "5": ["r' F r2 U' r' F"],
      "6": ["U2 r' F r F U' R U' R' U2 F'","U2 R' F R U' R' F' R r' F2 r","U2 R' F R U' R' F' R U r' F r","U' r' F r U F U2 R U' R' U' F'","U2 r' F' U' F' U F' r","U2 F' r U r2 F r U2 r' F' r","U' l L2 U L U' l' U L"],
      "7": ["r' F r U' F R U R' F'"],
      "8": ["F R U R' U F' r' F2 r","F R U R' U F' U r' F r","F U2 R U' R' F' r' F2 r","U' F R U2 B U' B' R' F'"]
    },
    "29": {
      "1": ["L' U' L U L' U' L"],
      "2": ["U2 F U' F' r' F' r","U2 F U R U R' F' U' r' F r","U2 F U R U R' F' U2 r' F2 r"],
      "3": ["U' F R U' R' U R U' R' U F'","U r' F' r F U' R U' R' U F'","F' r U r' F' r U r'"],
      "4": ["U' F R U R' U' R U2 R' U F'","U' F U R U' R' U R U R' U F'"],
      "5": ["U F' r U r2 F' r","U F R U' R' F' U r' F' r","F R U' R' U F' U r' F' r","F R U' R2' F R F' U F'","U R' F' r U r2 R F' r"],
      "6": ["U r' F2 r R' F R U R' F' R","r' F2 r U' F U R U' R' U2 F'","U r' F' r U2 F U R U R' U2 F'","U r' F r U2 r' F' r2 U' r' F","U2 r' F2 r U' F U R U R' U2 F'","U2 F U R U R' U2 F' U' r' F' r","L' U' l U L' U' L M'"],
      "7": ["F U R U2 R' U F' U r' F' r","r' F' r U' R' F R U R' F' R","U r' F' r U' F R U2 R' U2 F'","U' F R U' B U' B' R' U2 F'","F U R U2 R2' F R F' U F'","U L' U B' U2 B L"],
      "8": ["U F U R U' R' U' F' r' F' r","U F R U R' U R' F R F2","U F U2 R U' R2' F R F2'"]
    },
    "30": {
      "1": ["r U' r' F U' r' F r","U' F U' R U R' F' r' F r"],
      "2": ["U2 r' F r F U F'"],
      "3": ["U' F U' R U R' U' R U R' F'","U' F U' R U R' U F' r' F r","U' F U' R U2 R' U R U' R' F'","r U' r' F r U' r' F","r R' U' r' F r U' r' F R"],
      "4": ["U F U' R U' R' U R U' R' U2 F'","U r' F' r U F R U' R' U' F'","U L' U' L U' L' U' L F U F'"],
      "5": ["U' F U' R U' R' U' F'"],
      "6": ["U r' F r F U' R U2 R' U2 F'","U2 F U2 R U R' U R U' R' U' F'","U' F U R U f R' f' R' F'","U f R' F R f' R' F R F2","U' F U2 r R' U R U' r' U' F'","U2 F U R U' R' U' R U' R' U' F'"],
      "7": ["U' F U' R U2 R' F'"],
      "8": ["M' U M U2 R' F r U' r' F R","U2 r' F r F U R U R' U' F'","U F2 R' F' R2 U R' U2 F'","U' F U' R U' R2' F R F' U' F'","U' F U' R f R f' R' U' R U' R' F'"]
    },
    "31": {
      "1": ["U r' F r U' F R U' R' F'","U F U' F' r' F2 r","U2 F U2 F' r' F' r","U r' F L' U L U' r"],
      "2": ["U r' F r U2 F' r U r'","U F U2 F' U2 r' F r","U F U2 F' U r' F2 r","U r' F2 r U F' r U r'"],
      "3": ["U2 L F' L' F L' U L","U r' F2 r U2 F U' F'","U r' F2 r U' F U2 F'"],
      "4": ["U r' F r U' F U' F'","U r' F r F U2 F'","r' F2 r F U F'","U F U' F R' F' R F'"],
      "5": ["U F U' R U' R' F' r' F2 r","F R B U2 B' R' U F'","F R U2 R' U F' r' F2 r","U R' F r U M U R' F' R","U F U' R f R2 f' R' F'","F' r U r2 U' F' U r"],
      "6": ["F R U R' U2 F' r' F2 r","r' F' r U' F R U R' U F'","U2 r' F2 r F R U R' U F'","U r' F' r U' F R U2 R' U F'","F R U' R' F2 r U r'","U' F R U' R2 F R F2","F R U2 R' F' U L' U2 L"],
      "7": ["U2 r U' r' F U r U' r' F","U F U' R U2 R' F' r' F2 r","U F U' R U2 R' F' U r' F r","U2 r' F2 r U' F R U2 R' F'","U F2 R' F' R2 U R' F'"],
      "8": ["U r' F U' R' F2 R U r","r' F' r U2 R' F R U2 R' F' R","F R U R' U F' U2' L' U L","U R' F R U' M' U' r' F' R","U r' F r F U' R U' R' F'","U2 F U R U2 R2 F R F2"]
    },
    "32": {
      "1": ["L' U L U' L' U L U' L' U L","U2 F U' R U2 R' U R U R' U' F'","U' R' U' R' D R U R' D' R2"],
      "2": ["L' U L U' L' U L2 F' L' F","U' F U' R U R' U2 R U' R' F'","U' F U R U' R' U2 R U2 R' F'","U F R2 U2 R' U' R U' R2 F'"],
      "3": ["F U' R U R' U' R U2 R' F'","U2 F U' R U2 R' U F'"],
      "4": ["F U2 R U' R' U2 R U R' U F'","F R' F R U R U' R' F2","U' r' F' U' R' F R U r","U' F U R B U' B' R' F'","U' L' U' l U' R' F R U M'","U2 L' U' L U L' U' L2 F' L' F"],
      "5": ["U F R U' R' U R U' R' U2 F'","U F R U' R' U F' U2 r' F' r","U2 F' r U r' U L' U' L"],
      "6": ["U' F U' R U R' U F'"],
      "7": ["U' F U' R U R' U R U R' U' F'","U2 F R U2 R' U R U' R' U F'"],
      "8": ["F U2 F R' F' R2 U2 R' F'","F U2 R U' B U' B' R' F'","U F R U' B U2 B' R' U' F'","U' l' U2 l U2' l' U l U2' l' U2 l"]
    },
    "33": {
      "1": ["U R' D R U' R' D' R","U' F R U2 R' U' R U' R' F'","L' U' L U2 L' U' L"],
      "2": ["U' F R U2 R' U2 R U R' U' F'","U' F U R U R' U R U' R' U F'","U2 r' F2 r U R' F R U R' F' R","L' U L F' L F L2' U' L"],
      "3": ["F R U' R' U' R U' R' U2 F'","U R' F' R U r' F' r R' F R"],
      "4": ["F U' R U' R' U R U R' U' F'","R' F r U' r' F' R U r' F' r","F U R U R' U R U R' U F'","U F U R U' R' U' R U' R' U F'","F U r U' r' U r U r' U' F'"],
      "5": ["U2 F U R U R' U2 F'","r' F' r R' F R U R' F' R","r' U' F' R' F R U r"],
      "6": ["F U' R U' R' U F'","R' F' r U M U r' F' r","U' r' D R2 U' R' U R' D' r"],
      "7": ["U' F R U2 R' U2 F'","U' r' F r U' R' F r U r' F' R","r' F2 U' F2 U r"],
      "8": ["l' U2 l U2' l' U' l U2' l' U2 l","U r' D R U R U' R' U' R' D' r"]
    },
    "34": {
      "1": ["U2 L' U L U2' L' U L","U F R U2 R' U R U R' U F'","U2 F U2 R U R' F' r' F r"],
      "2": ["U' F R U R' U R U R' F' r' F r","U r' F' r F R U R' U2 R U2 R' F'","U R2 F R U' R U R' U R' F' R2","U r' U' F' U' R U R' F U r","U F R F U R' U' R F' R' F'","U' F R U R' U R U R' U2 R U R' F'","U r' F r F R U R2 F R F2","U' F R U R' f R' F' R f'"],
      "3": ["U2 F U2 R U' R' U' F'","r' U' R' F' R F U r"],
      "4": ["U F R U R' U2 R U' R' U F'","U' M U' r' F r U R' F2 r","r' F r2 U' r' F r' F' r"],
      "5": ["U2 L' U L U' L F' L' F","U2 F U2 R U R' U' R U R' F'"],
      "6": ["U M' U r' F' R U2 R' F R","R' F R U' R' F' R r' F r","U' F R U R' U R U' R' U' F'","r' U' R' F' R U F r","U2 F R U B U' B' R' F'"],
      "7": ["U2 F U2 R U2 R' F'","F R2 D r' U r D' R2 F'","U' L' B' U2 B U2 L"],
      "8": ["r' D R U R U R' U' R' D' r","U2 F' L F L2' U2 L2 F' L' F","U F R U2 R2 F R F' U2 F'"]
    },
    "35": {
      "1": ["U' F U F' U' r' F r","U' r' F U r U r' F' U' r"],
      "2": ["F U F' U L' U' L"],
      "3": ["U' F U' F' U' r' F' r","R' F R U R' F' R U r' F' r"],
      "4": ["U' F U F' r U' r' F","U2 F U' R U R' F' U' r' F' r","r' F' r U' F U R U2 R' U2 F'"],
      "5": ["U' r' F r U' F R U R' U2 F'","U F U R U' R' U F' U r' F' r","U F U R U' R2 F R F' U F'"],
      "6": ["r' F' r U F U2 R U' R' U F'","U2 F U R U' R' U F' U' r' F r","U' r' F2 r U' F U R U R' U F'"],
      "7": ["U' r' F r F U R U' R' U F'","r' F r F U R U R' U F'"],
      "8": ["r' F r U F R U2 R' U F'","U' r' F2 r F R U2 R' U F'","U2 r' F' r U F R U R' U2 F'"]
    },
    "36": {
      "1": ["U2 r' F' r U' F U F'","U2 r' U r' F' r F' r"],
      "2": ["U' r' F' r U F U' F'"],
      "3": ["U' r' F' r F' r U r'","U' r' F r U' F U R U2 R' F'","U2 r' F' r U F U R U2 R' F'"],
      "4": ["U' r' F r U F U F'","U F R U R' F' U r' F' r"],
      "5": ["U' r' F r U F U2 R U' R' F'","r' F2 r U' F U R U' R' U F'","r' F' r U2 F U' R U R' U2 F'"],
      "6": ["F U R U R' U F' U' r' F' r","U' r' F r U' F U R U' R' U' F'","U2 r' F' r U F U R U' R' U' F'","U r' F' r U' F U' R U' R' U' F'"],
      "7": ["F U R U' R' U' F' r' F2 r","F U R U' R' U' F' U r' F r","U r' F' r U' F U' R U2 R' F'","U' r' F r U F U R U R' U' F'","U2 r' F' r U' F U R U R' U' F'","F U R U R' U' F' U' r' F r","r F R' U' R F' r2 F2 r","U2 L' U2 L U' F U' R U R' U2 F'"],
      "8": ["U2 r' F' r U' F U2 R U' R' F'","r' F r F U2 R U2 R' U2 F'","U L D R' F R D' L' U' L' U L"]
    },
    "37": {
      "1": ["U' r' F r F U R U2 R' U F'"],
      "2": ["U2 r' F r U' F U2 R U' R' U F'","U2 F U' R U R' U2 F' U r' F' r"]
    },
    "38": {
      "1": ["L' U L U' L' U2 L U' L' U L","F U' R U2 R' U' R U' R' U' F'"],
      "2": ["U' F U R U R' U' R U R' U2 F'"],
      "3": ["U' F R U2 R' U' R U R' U2 F'","F U' R U2 R' U' R U2 R' F'","F' L F L' U L' U L U' L' U' L","U2 L' U L U' L' U2 L2 F' L' F"],
      "4": ["r' F2 r R' F R U' M' U2 r' F' R","F U R U R2 F' U' F U R U2 F'","r' F' U' R' F R F' R' F R U r","F R B U B' U' R' U R U R' U2 F'"]
    },
    "39": {
      "1": ["F U R U R' U R U2 R' U F'"],
      "2": ["F R U2 R' U R U2 R' U F'","U L' U L U L' U' L U' L F' L' F"],
      "3": ["U F U2 R U' R' U R U2 R' F'","U2 F U2 R U' R' U R U' R' U' F'","F U r U R' U R U2 r' U F'","U2 F' L F L2' U2 L U L' U' L"],
      "4": ["F R f R f' R' U' R U2 R' U2 F'","M' U' r' F r U r' F R U2 R' F R"]
    },
    "40": {
      "1": ["U2 r' F r F R U' R' U' F'","F U2 R U R2' F R F2'"],
      "2": ["r' F r F R U2 R' F'","L' U M' U l U2' l' U' l","U L' U L U F R U R' U F'"]
    },
    "41": {
      "1": ["F U R U R' F' r' F' r","U' F2 R' F' R2 U' R' U2 F'"],
      "2": ["F R U2 R' F' r' F' r","R' F R U2' R' F' R r' F' r","F U' R U' R' F' U' L' U' L"]
    }
  },
  BR: {
    "1": {
      "1": ["f R' f'"],
      "2": ["U' r' U' R U M'","R' U F' U' F R","R2 F R F' U' R"],
      "3": ["U R2 F R F' R","r' U r U' r' U' r","R' U' F' U' F R"],
      "4": ["R' F' U' F R"],
      "5": ["U2 R D r' U r D' R'","R' U2 R f R' U R U' R' f'"],
      "6": ["R D r' U' r D' R'","S R U R' U' R' S'","f R' U R U' R' f'","U f R' U R' U' f'"],
      "7": ["R' U' R2 D r' U' r D' R'","U' R' U2 R' D' r U r' D R2","U f R F' U' R' U R S'","U2 F R U R' U' S R f'","R' U' R f R' U R U' R' f'"],
      "8": ["U R' U R2 D r' U r D' R'","U' r' U' r U2 M U' M'","R' U R S R U R' U' R' S'","R' U R f R' U R U' R' f'"]
    },
    "2": {
      "1": ["U2 R' U R"],
      "2": ["R' F' U F U' R","U' R B' R' B","U' M U' R' U r","U2 f R' U R U' f'","U' R' U F R' F' R2"],
      "3": ["U2 R' F' U F R","U2 f R U R U' f'","U2 R' U' R U S' R' U R S","f R f' R' U2 R"],
      "4": ["U2 R' F U R U' R' F' R","U2 R' F R' F' R U R","U2 F R' U R2 U' R' F'","U R' U R' F R F' U R","U R' U' R S' R' U' R S","U2 f U R U' f'","U R' U2 F' U' F U R"],
      "5": ["U r R2 U R U' r' U2 R","U2 S U' R' U R S' R' U R","U' r' R U' R' U' R U R' U r","U2 F R U' R2 U2 R2 U R' F'","U2 S R' U' R U R' U R U' S'","f' R' F U' F' R f","f R U R2 U' f' U R' U R"],
      "6": ["U2' S' R' U R S","U2' R2 F R F' U R","U R' U F' U F R"],
      "7": ["U' F R U R' U' F' R' U R","U R' U' R S R' U' R U S'","U' F R U R' U' R' U R U' F'","U R' U R S R' U R U' S'","R U2 R' U2 R' U' F R F'","R' F' U F U' F' U' F U R","U' R' U R f R f' R' U' R"],
      "8": ["U2 R' U' r U' r' U2 r U r' U2 R","r' F' D R U' R' D' F U r","U R' U' R2 D r' U r D' R2 U' R","U2 S R' F U R U' S' R' F' R","U2 R' S R' U' R' U R S' U R","U' F R F' U2 S' U S"]
    },
    "3": {
      "1": ["U' R' U' R"],
      "2": ["U' S R' U' R U S'","U2 r R' U R' U' r' R2","U R' U' F' U2 F R","U2 F U R' U' R2 U R' U' F'","U' R' U' R F R U R' U' F'"],
      "3": ["U' R' U' R U R' U' F' U F R","U' S' R' U2 R S R' U R","U r' U r U r' U R U R' U r","U r' U r U r U' r2 U' r2 U r'","f R2 f' U' R' U R","R' F R' F' R U R U2 R' U' R","U R' U' R U' R' F' U' F U' R"],
      "4": ["U r' U r U r' U' r","U f U R' U' R' U R' U' f'","S' R' U2 R S U' R' U' R"],
      "5": ["U' R' U' F' U' F U R","U' S' R' U' R S","F U R U' R' F' R' U2 R"],
      "6": ["U' R' U2 F' U F R","U2 F U R' U' R U R U' R' F'","U' R' U' F2 r U r' F R","U' R' F' U' F R U2 R' U R","U' R' U R U R2 F R F' U R","U2 F U R' U' F' R U R U' R'"],
      "7": ["U R' U' F' U F U R","S' R' U' R S U' R' U' R","U' R' U2 F R' F' R U R","U' R' U2 R f U R U' f'"],
      "8": ["U' R D r' U' r D' R' R' U' R","U R' U F' U' L' U L U' F U R","U R' U' F' U2 L' U L U' F R","U' S R' U R U2 R U S' R U' R'"]
    },
    "4": {
      "1": ["U' f R f'","R' U F R' F' R U' R"],
      "2": ["U2 r R2 U R U' r' R","U2 R' U2 l U' R U l'","U' R' U' F U R U' R' F' U R","U' R' U2 R U R' U R' F R F' R","U' S U' R' U R S'","U f R U R2 U' f'"],
      "3": ["U F R' F' U' R U R U' R'","U S' R' U R S R' U R","U' r' U2 R U R' U r U2 R' U' R"],
      "4": ["U F R' F' U' F R F'","U2 R' U2 R U R' F' U' F R","U R' U' R' F R F' R U2 R' U R"],
      "5": ["U' R' U R' F R F' U2 R' F R F' R","U F R' F' U' F R2 U R' U' F'","U2 R' U2 R U R D r' U' r D' R'","U' f R U R U' R' f'","U' S R U R U' R' S'"],
      "6": ["U2 R2 D' r U r' D R2","U' R' U R U2 r' U r U2 r' U' r","U' f R2 U R' U' f'"],
      "7": ["U2 R' r U' r' U2 r U r' R","U R D r' U r D' R2 U R"],
      "8": ["U F R' F' U2 F U R2 U' R' F'","U R2 D' R U' r R' U' r' D R2","U R' U2 r U' r' U2 r U r' U R","U2 R' U2 R U R2 D' r U' r' D R2","U S R' U' R U R U R' U' R' S'","U R' S R S' R' U R S R' S' U R","U' R' U' R U f R' U R2 U' f'","U' R' U R U' f U R U' R f'","R' U' F' U' r' F r U F U' R"]
    },
    "5": {
      "1": ["U' R2 F' U' F U R2","y U' R' D' R U R' D R U R U' R' y'","U2 f R f' U2 f R' f'","r' U r U2 r' R U R' U' r"],
      "2": ["U2 R' F R U R' U' F' R","f U R U' R' f' R' U2 R","U' R U R' f' U f U' R'","R2 F R F' R U R' F' U' F R"],
      "3": ["r' U R U' R' U' r","U' R' U' S' R U R' S R","R' U S' R U' R' S U' R","f U R' U' R f' U' R' U' R"],
      "4": ["U2 R' U R U R' U2 R' F R F' R","F U R' U' R S R' f'","U' r' R' F' U' F U r R","U' R' U2 R' F2 r U r' F R U' R","r' U R U' R' U R U R' U r","F R U R2 F R F' R' U' R F'","U R' U R U F R U R2 U' R F'","U' R' U2 R' U' F' U F R U2 R","R' F' U F U R' F R F' R","U S U' R U R' U' R' U S'"],
      "5": ["U2 r' U' r U2 r' U' R U' r R'","U2 f R U R' U' R f'"],
      "6": ["U' R2 D' r U r' D R U' R","U R' U R f R2 U R' U' R f'"],
      "7": ["U f U R U' R2 f'","R2 D' R U2 r R' U r' D R2","U R' r U' r' U2 r U r' R U2 R' U' R","U r' U r U2 r' U' r R' U' R U' R' U' R","f R U R U' R' f' U' R' U' R"],
      "8": ["F U R U' R2 F' U' F R F'","R2 F R F' R U2 R2 F R F' R","U2 R' U' R' D' r U r' D R2 U R' U' R","U2 R' U R f U R2 U' R f'","R' F' U' F U' R U f R f'","U S U' R' U R F U R' U' f'"]
    },
    "6": {
      "1": ["R' U' R U R' U2 R"],
      "2": ["r2 D' F2 r U' r' F' D r2","F U R2' U' R U R' U' R' F'","U' r D r' U' r D' r2' R U' R' U r","R' U' R U' R' U2 F' U F U' R","U' R' U R' F2 r U r' F R2","f R' f' U' R' U R U' R' U R","U R' U R U2 R' U F' U F U' R"],
      "3": ["R' U' R U R' U F' U F R","M R' U' R U2 R' U R U' M'","U S' U' R' U' R U2 R' U R S","U' r' U2 r U r' F' U F U r","R' U' R U2 R2 F R F' U R","R' U' R U2 S' R' U R S","U R' F' U' F U F' U F R"],
      "4": ["U R2 F' U' F U R U R","R' S' R U R' S U2 R","U' R D R' U' R D' r' U' R' U r","f R2 f' R' U2 R U R' U' R","R' U' R U R' U2 F' U' F U R","R' U' R U2 f U R U' f'"],
      "5": ["R' U' F' U F U' R","R' U' R U' r' R U' R' U r","U R' U S U R U' R' S' R"],
      "6": ["r' U' R U r R2' U2 R","U' S U R' U' R S' U R' U2 R","R' U' S R U R' U' S' U' R","U S' U' R' U' R U2 S R' U R","r' U' R U r R' U R' U R","U S' R' U S U S' R S","r' U' F' U F U' R U r R'"],
      "7": ["U R' F' U' F U2 R","U R' F' U' F R U R' U R","F R U R' U' F' R' U2 R","U' R' U' R' F R F' U R U R' U' R"],
      "8": ["r' U r U2 r' U' r U R' U R","U R' F' U' L' U L U F U R","R' U F' U' L' U' L U F U R","U R2 D' r U r' D R U R"]
    },
    "7": {
      "1": ["f R U R2 U' R' U R' U' f'","y U2 R U2' R' U2 R U' R'","f R f' U R' U' R U2 R' U' R","r' U' r U' r' U r U r' U r"],
      "2": ["U' F R U R2' U' R F'","U' F R U R' U' F' U R' U' R","U' f R U R2 U' R f'"],
      "3": ["U' r U2' R2' U' R2 U' r'","U2 F U R U' R' F' R' U' R","f R U R2 U' R2 f'"],
      "4": ["U' r U2' R2' U' R U R U2' r'","S U' R U2 R2 U2 R2 U R S'","R' U2 S' R U' R' S U' R","U' R2 F R F' U R U2 R' U R","R' U R r' U R U' R' U' r"],
      "5": ["U2 f R2 U R' U' R f'"],
      "6": ["U2 R D r' U' r R' U2 R D' R'","S U R U2 R U2 R2 U' R S'","U f U R U' R f' U' R' U R","R' U' R U R' U' R f U R2 U' f'","U' R' U F' U r' F' r U F U' R","R' U R' F R F' R U2 R2 F R F' R"],
      "7": ["R D r' U r R' U2 R D' R'","U F U R U' R' S R' f'","R' U R U2 f R U R' U' R f'"],
      "8": ["U' r' U' r U R' U M U' r","U' S' U' S U2 F R' F'","R' U R U f U R U' R2 f'","U2 S U2 R U R' U' R' U' S'","R' U F' U F U R U' f R' f'","R' U F' U' F U R U f R' f'","U2 R' U' R U f R U R' U' R f'","R U R' U R' U' R S R' S' R U' R'"]
    },
    "8": {
      "1": ["R' U2 R U R' U2 R"],
      "2": ["R' U2 R U R' U F' U F R","U' R' U' R U' R' U R2 r' U' R' U r","U2 R' U R' U' F' U F R U' R","U R' U' F U R U' R2 F' R2","R' U2 R U2 S' R' U R S","U' R' U' F' U2 F U' R"],
      "3": ["U' R D R' U2 R D' r' U' R' U r","U' F' r2 F2 r U2 r F","R' U2 R U2 R' F' U F R","U2 R' U' F' U2 F U2 R","R' U R U' R' S R U' R' U S' R"],
      "4": ["U' R D r' U2 r D' r' U' R' U r","U' r' R U R' U2 R U R' U2 r","R' U R' F R F' R U' R' U R","f R U R2 U' R U R2 U' f'","f R' f' U R' U R U' R' U R"],
      "5": ["R' U2 F' U F U' R","R' U2 R U' r' R U' R' U r","U2 R' U' R U' R' U F' U F U' R"],
      "6": ["U2 R' U' r U' R' U R U r' U2 R","U' r U' r U2 r' U2 R' U' r2 U r","U' R' U' R U R' U' R U' R' F R' F' R2","U R' U R U2 R' U' F' U F U' R"],
      "7": ["U' R' U' F' U F R U R' U2 R","U' R' U' R U R' F R' F' R U2 R","S R' U2 R U R' U2 R S'","U r' U' R U R' U R U' R' U' r","R' F' r U' r' F2 U R","R' U' F' r' F r F U2 R","R' U2 R U2 f U R U' f'"],
      "8": ["U' M U M' U2 r' U r","U2 R' U' R' F R F' U2 F R' F' R2","F U R U' R' S R f' R' U' R","R' F' U' L' U' L U F U R","U' f U R U' R2 f' U R' U' R"]
    },
    "9": {
      "1": ["R' U' R U' R' U' R"],
      "2": ["U R' U R' F R2 U R' U' F' R","F R U R' U' S R2 f'","R' U' R U R' U' F' U2 F R","U R' U R U R' U2 F' U F R","R' U R U2 f R' U R' U' R f'","U f R f' U R' U' R U R' U2 R","R' S' R U R' S U R U R' U' R"],
      "3": ["U r' U R U R' U' r","U' R' F R U' R' U' R U R' F' R","U' R' F R' F' R2 U' R' U' R","U R' U S' R U R' S U' R","U2 f R' f' U R' U' R","f R f' U2 R' U' R","U2 R' U R' F R F' U2 R"],
      "4": ["r D r' U r D' r2' U r U r' U' r","R' U' R U R' U' F' U F U R","U2 R' U R U' R' U F' U2 F R","f R U R' U' R' U R' U' f'"],
      "5": ["U' R' U F' U' F U2 R","U' R2 F R F' U' R U R' U2 R","U' S' R' U R S U R' U R","U2 f U R' U' f' U' R' U R"],
      "6": ["U' R' F R U R' U' F' U2 R","R' U' r U' R' U' R U r' R","U R' U R U' r' U r U r' U' r","R' U' R U' R' U' F' U' F U R","R' U' R U' S' R' U' R S","U' R' U R' F' U' F U R U R"],
      "7": ["R' U' R U r' U r U r' U' r","U R' U R U S' R' U' R S","U2 S U' R' U R U R' U' R S'","U R' U R U R' U' F' U' F U R","S' R' U' R S f R' f'","U' f R' U R' U' R f' R' U' R","R' U R U2 R' U2 F' U F U R"],
      "8": ["U' R' U R' D' r U r' D R U R","U r' U r U2 r' R U' R' U' r","U2 S R U R U' R' S' R' U' R","U' R' U F' U' L' U L U F U R","R' U F' U L' U' L U2 F U2 R"]
    },
    "10": {
      "1": ["U' R2 U' F' U F R2","f R f' U' R' U R U2 R' U R","f U R' U' R' U R2 U' f'"],
      "2": ["U R' U' R' F' U' F U R2","R' F' U' F U R U' R' U R","R2 F R F' R f R f'"],
      "3": ["R' U R U' f R f'","U2 R' U' F' U F U2 R","R' U2 F R' F' R U' R"],
      "4": ["U2 r' U' R U r R2' U R","U2 R' U F' U F R U' R' U' R","U' F R' F' U' R U R U' R2 U R","U2 R' U S' R U2 R' S R","R' U R U' S U' R' U R S'","U2 R' U2 R' F R F' R U2 R' U R","R' U R U f R U R2 U' f'","U' R' U F' U' F U' R U' R' U R"],
      "5": ["U' M U' R2' r U2 M U' r","U' f R' U R U' R2 f'","r' F' U' F U R U' R' U r","R' U R U' f R U R U' R' f'"],
      "6": ["U2 r' U r U2 r' U' r R' U R","f U R' U' R' U R3 U' R' f'","r' U2 r U r' U r U' r' U2 r","R' U R U f R U R' U' R' f'"],
      "7": ["U2 R2 D' R U2 r R' U' r' D R2","r R2 F' U F r' R U' R","U' R U R' S R S' R U' R'","U2 R' U r U' r' U2 r U r' U R","R' F' U F R U R' F' U' F R","U' f R' U R U' R' U R' U' f'"],
      "8": ["U R' U' R' D' r U r' D R U' R","R' U R U' f R2 U R' U' f'","R' U' F' U' F U R f R f'"]
    },
    "11": {
      "1": ["U' R U2' R2' U' R2 U' R'"],
      "2": ["U' R' F R' F' R U' R U' R' U' R","U' R' U r U' R' U R U r' U2 R","R' U R U' R' U F' U2 F U2 R","U R' U R f R2 f' U R' U' R","U' f R U R' U' R U R' U' R f'","U2 R' U2 F' U' F U' R U' R' U' R","U' R' U' R U' f R f' U' R' U' R"],
      "3": ["U2 r' U R U R' U' r U R' U' R","U' S' R U2 R2 U' R2 U' R' S","f R2 f' U R' U2 R U R' U2 R","U2 R' U R U' f R' f' R' U' R","U' f R' f' U R' U2 R U' R' U R","U' R' U R U' R' U F' U F U' R","U R' U' R U' R' U F' U2 F U' R","U' R' U R' F R F' U R U' R' U R"],
      "4": ["U2' F U R U2 R2 U' R2 U R' F'","U2' R' U R U' R2 F R F' U2 R","U2 f R2 f' U R' U' R","R U2 R2 F R' F' R' U2 R'"],
      "5": ["U' R' U F' U2 F U2 R","U' R' F' U' F U' R U R' U2 R","F R U R' U' F' U2 R' U' R","F R U R2 U' R F' U' R' U R","U2 f U R U' R' f' R' U' R"],
      "6": ["U' R U2 R2 U' R U' R' F R F'","U' R2 F' r U' r' F2 R U R","R U2' R2' U' R2 U' r' U' R' U r","R U2 R2 U' R2 U' f' U' f","U' R' F' U' r' F r F U2 R","U f R U R U' R2 f' U R' U' R","U R' U' F' U' F U' R U' R' U' R"],
      "7": ["U' R' U' R U' l U' R' U l' U' R","U' R2 F R F' U2 R U2 R' U R","U' R' U' F' U F U' R U' R' U' R","U' R2 F R F' U2 R U R' U2 R","U R' U2 R U' f R' f' R' U' R","U' R' F' U' F U' F' U F U' R","U f U R' F R F' R' U' R f'"],
      "8": ["U' R' U R' F R F' U2 F R' F' R2","U' R D R' U2 R r' U r D' R2 U' R","U' R2 F R F' U2 F' U F U' R","U R' U' F' L' U' L U' F U2 R","U R' U' F' U L' U2 L F U R","U f U R2 U' R f' U' R' U R"]
    },
    "12": {
      "1": ["R' U' R U R' U' l U' R U l'","U S U' R' U2 R U2 R' U R S'","U R2 U' R' F R F' U R U' R","U R' U' R F R U R2 U' R F'","U' R' U R' F R F' U2 R U2 R' U' R","R2 U' R S U R U' S' R","R' U2 R U f R U R2 U' f'","R' U2 R U' S U' R' U R S'"],
      "2": ["R' U' R U R' U R U f R f'","U2 R' U2 R F R U R2 U' R F'","U R' U' R' F R F' U R U2 R' U R","U' R U R2 U R2 U2 R' f R' f'"],
      "3": ["R' U F' U' F U R U' R' U R","U' R' U' R U R' U R f R f'","R' U' R U R' U' R U f R' f'","R' U R' F R F' R f R f'","R' U F' U F R f' U f R'"],
      "4": ["R' U' F R' F' R U' R","U' F R' F' R U2 R U2 R2 U' R","R' U' r U R' U' r' R U' R","R' S U' R U R' S' U2 R","U' S' U R' U2 R U R' U2 R S","R' U2 R U' f R f'"],
      "5": ["U' f R' U R2 U' R2 f'","R2 F2 R U' F U R' F2 R2","R' U2 R2 D r' U r D' R2 U2 R","R' F' U' F U R f R f'"],
      "6": ["U' R' U2 R U r' U r U2 r' U' r","U' R' U2 R U f U R2 U' f'"],
      "7": ["U' R D r' U' r' U' R' U r2 D'","U' f U R U' R U R' U' R f'","f R2 U R' U' R f' U2 R' U' R"],
      "8": ["U' R' F' r' F r U' r' F r U F R","U' R' U2 R U2 f U R U' R f'","U' R' U' R U2 R D r' U' r D' R2 U R","U' r R' U' r' U2 r R' U R U r' U R","R' U F' U F R U f R' f'","R' U2 F' r' F' r U2 F U' R","R' U R U' f R' U R U' R2 f'"]
    },
    "13": {
      "1": ["R' U R U' R' U' R"],
      "2": ["U' r D r' U r D' r' R' U' R","l U' l' R' U' R U l U l'","U R' F' U F R U2 R' U' R","U f R' f' R' U R U' R' U' R"],
      "3": ["U' M U R' U R U' R' U' R U M'","R' U R U' S' R' U' R S","S' R' U R U' R' U' R U2 S","R' U R U' R' U' F' U' F U R","R' U r U' R' U' R U r' R","R' U' R f R U R U' R2 f'"],
      "4": ["U R' U' R U' R' U2 R2 r' U' R' U r","U R' U' R U' R' U' F R' F' R2","S R' U R U' S' R' U' R","R' U R U' R' U2 F' U F R","R2 F' U' F U R2 U' R' U' R","f R f' U' R' U R U' R' U' R","U r' R U' R' U r U' R' U' R","R' U2 R U r' U R U R' U' r"],
      "5": ["U' R' F U R U' R2 F' R2","U' R' U' R U l U' R' U l' U' R","R' U R U R' U' F' U F U R","R' U R U' R' U2 F R' F' R U R"],
      "6": ["R' S U R U' R' S' U' R","S R' U R U' R' U' R U S'","U' R' F' r U' r' F2 U2 R","r' F' U' F U r R' U' R","U R' U' F' U' F U R U' R' U' R","R' U R U R' U' F' U2 F R"],
      "7": ["R' U R U r' U r U r' U' r","S' R2 D' R U' R' D R2 S","U' F U R U' R' F' U' R' U' R","S' R' U R S f R' f'","R U f R' f' R2 U' R","U' f R U R' U' f' U R' U' R"],
      "8": ["U r' U r U' r' R U2 R' U' r","U r' U r U2 r' U' r U' R' U' R","U2 R' F' L' U L U' L' U L F R","U r' U r U R' U2 r' R U r"]
    },
    "14": {
      "1": ["U' r' U r' F2 r U r' F r2","U R' F R' F' R U' R U R' U' R","U' r' U2 R U R' U2 R U R' U' r","f U R U' R U R2 U' R f'"],
      "2": ["U' R' U R U2 R' U R' F R F' R","U2 R' F' U' F U2 R U R' U' R"],
      "3": ["U' r' R U R' U' R U2 R' U r","U2 r' U R U' R' U' r R' U R","U' R' U F' U F U' R U' R' U R","U2 R U R' U R U2 R2 F' U' F R","U2 R' U S' R U' R' S R","R' F' U F U F' U' F U2 R","U' R' U' R U' R' U R f R f'"],
      "4": ["U' r' R U R' U' R U R' U2 r","U' r' U2 r U2 r U' r2 U r2 U r'","U r R' U' R' U' R U r' U2 R","U2 R' U R U' R' U' R U f R f'","U F R' U R U' R U R2 U' R F'","S' R' U' R U R' U2 R U S","S' R' U' R S U2 R' U R","f R U R' U' R U R2 U' f'"],
      "5": ["U' r' R U2 R' F' U' F U2 r","U' R' U F' U r' F r F U' R","U' R D r' U' r D' R' U' R' U R","f R U R' U' R U R' U' R' f'"],
      "6": ["U' r' U R' F2 R U r' F r2","U' r' R U R' U r U2 r' U r","U2 F U R U' R' S R f'","U f U R' U' R U R2 U' f'","U' R' U' R f R' U R2 U' f'"],
      "7": ["U' R' U' R2 D r' U' r D' R2 U R","U r' U2 r U r' U' r U' r' U2 r","U r' U' R U' R' U' r U2 r' U' r","U f U R' U' R U R' U' R' f'","U' R U' R' S R S' U2 R U' R'"],
      "8": ["U R' U' R' D' r U' r' D R U' R","R' F' U' r' F' r U r' F' r U F R","R' U R U f U R' U' R U R2 U' f'"]
    },
    "15": {
      "1": ["U' r R2 U F' U F U2 r' R2","U2 r2 F' r U' r' F2 r U' r","R' U' S' R U' R' S U' R","R' r U' r' U r U r' U R","U R' U' R f U R' U' R' f'","U2 r' R U' R' U r U R' U' R","U R' U' R U2 R' U' R f R f'"],
      "2": ["U' R' F' U' F U R U2 R' U R","U F U R' U' R S R f'","U' r' F' R' U2 R U R' U R F r","U R' U' R' F R F' U2 R U' R' U' R","F' r' F' r U F R' U2 R","R U R' U2 S U R' U' S'","U' R' U R f R U R2 U' f'","U R' F' U' F U R U R' U' R"],
      "3": ["U' R' U R U2' f R f'","U' R' U F' U F U2 R","U' R' U R U' R' U F R' F' R U' R","U' r' U r U' r' U' r R' U R U2 R' U R","U' f R2 U R U' R f'","U' R' U R S' R' U2 R S"],
      "4": ["U' R2 F R F' R U2 R' U R","U' R' U' F' U F R U' R' U' R","U' R' U' S' R U2 R' S R","S U' R' U R S' R' U2 R","R' U R f R U R2 U' R2 f'","R' U' R U f R f' U' R' U R"],
      "5": ["U' r' U r U' l U2 R' U R U2 l'","U' R' U' R2 D r' U' r R' U R D' R'","U R' U r U r' U2 r R' U r' R2","U2 r' R U R' F R' F' R2 U' R' U' r","R D r' U' r D' R2 U R U R' U' R","U' R' U' R U2 R' U' r U' r' U2 r U r' R","R' U2 R U f U R U' R2 f'","U' R' U R U2 f R U R U' R' f'","U' R' U R U2 S R U R U' R' S'","U R' U' R f U R U' R' U R U' f'"],
      "6": ["U' R' U' r U' r' U2 r U r' U R","U R D r' U r R' U R D' R'","U2 r' U r U2 r' U' r U R' U' R","R' U R U2 f R2 U R' U' R f'"],
      "7": ["U' R' U R U R2 D' r U r' D R2","U R' U' R r' U r U2 r' U' r","U R' U' R f U R2 U' f'","R U R' U2 S R' S' R U R'"],
      "8": ["U' R' U' F' U' r' F' r U F R","U' R' U R2 D r' U r D' R2 U R","r' R U2 R' U' r U2 r' U' r","U2 R' U2 r' R U r U2 r' U' r","R' F' U2 r' F r F U R","U2 R' U2 R f U R2 U' f'","U R' U' R U f U R U' R f'"]
    },
    "16": {
      "1": ["U' R' U' R U2 R' U R U' R' U R","U R' U' R U R D R' U' R D' R'","U' f U R U' R' U R' U' R f'"],
      "2": ["U' M' U' r' U r U M","U' R' F' r' F r F R","U' R' U2 R U R' F' U2 F R","U F R U R' U' S R' f'"],
      "3": ["U' R' U2 F' U' F U' R","U' r U R' U' r' U F R F'","U' f R' f' U2 R' U' R","f U R U' f' R' U' R"],
      "4": ["U' R D R' U R D' r' U' R' U r","U' R' U2 R U' R' F R' F' R2","R' U R U' f R' f' U2 R' U' R","R' U R f U R U' f' R' U' R"],
      "5": ["U' R' U' R U2 R' U R2 r' U' R' U r","U' R' U' R U2 R' U2 F R' F' R2","R' U R U' R' F' r' F r F R","U R' U' R U' f R' U R' U' R f'","f U R U' R' f' R' U' R U' R' U R","U' R' U' R U' R' F' U2 F U' R","U2 f U R' F R F' R' U' R2 f'","S' R' U R S U' f R f'","U' f R' f' U2 S' R' U' R S"],
      "6": ["U' R' U' F R' F' R U2 R","U' R' U2 R U R' F' U F U R","U' R' F' r' F r U' F U R"],
      "7": ["U R' U' S U' R U R' S' R","U' M' U' R' U' R U r' U R","U' F U R U' R' U R' U' R F'","U2 S' R' U' R S R' U2 R"],
      "8": ["U2 R' U R' D' r U' r' D R U R","U' R' F' L' U2 L U' F R","U' R' U' F' L' U' L U2 F R","f R' U R2 U' f' R' U' R","f R2 U R' U' f' U' R' U' R","U2 f U R2 U' f' U' R' U' R"]
    },
    "17": {
      "1": ["U' R' U' R U R' U2 R' F R F' R","U' l U' R' U l' U R U' R' U R","U2 R' U R U2 R' U R f R f'","U F U R' U' R2 U R2 U' R F'"],
      "2": ["U' R' U2 F R U R' U' F' R","U2 R' U2 F' U F R U R' U' R"],
      "3": ["U' R' U' F' U' F R U R' U' R","U' r' U2 R U2 R' U R U' R' U' r","U' R' U' R U R' U' R U' f R2 f'","U R' U' R U2 R' U R U f R f'","R2 F R F' R U' R' U2 R U' R' U R"],
      "4": ["U R' U' F' U F R U R' U' R","U2 S R' U2 R U' R' U R U S'","U' r' U R' U' R U' r R2' U2 R2","R' F' U F U' F' U2 F U' R","U2 F' U' r' F r F R' U' R","U R' U' R U R' U' R U' f R f'"],
      "5": ["R2 D r' U r D' r' U' R2' U r","f U R U' R' U R U' R2 f'"],
      "6": ["U' r' U F' U F U' F' U F U r","U' R D r' U r D' R2 U R U2 R' U' R","F R U R2 F' U F U2 R F'","f R U R' U' R2 U R2 U' R f'","f R U R2 U' R' U R U' R f'","U R' U2 R U' f R' U R2 U' f'"],
      "7": ["U' R' U' R U R' U' R2 D r' U r D' R'","U' R' U R' D' r U r' D R2 U R' U' R","U' R' U' R f U R2 U' R f'","U2 f U R U' R' U R2 U' f'","U f U R2 U' R' U R U' R f'","R2 F R F2 U' F U R U' R' U' R"],
      "8": ["U' R' U' R' D' r U' r' D R2 U R' U' R","U2 R' U R U' f R' U R2 U' f'","R' F' r' F2 r U' r' F r F U2 R"]
    },
    "18": {
      "1": ["U' R' U2 R U R' U' R"],
      "2": ["U' R' U2 R U' r' U r U r' U' r","U R' U' R U R' U' F' U F U' R","U' f R f' U' R' U R U' R' U R","U f R' f' U' R' U2 R U R' U' R","U' f R F' U' R' U R F R f'","F' r' U2 F U F' U2 r F"],
      "3": ["R2 F R F' U R' F R F' R","U R2 F2 r U r' F R2","U' R' U' R U2 R2 F R F' U2 R","U' R' U' R U R' U F' U F U R","f R' f' R' U' R U R' U' R","R' U2 R U2 R' F' U' F U' R"],
      "4": ["U' R' U' l U' R U R' U' R U l'","U' R' U2 R U S' R' U' R S","U' r R2 U2 R U R' U' R U r' R","U2 R' U R' F R F' U R U R' U' R","U' R' U2 R U R' U' F' U' F U R","R' U F' U L' U2 L U' F R","U' f R2 f' R' U' R U2 R' U R","U2 f U R' U' R U R2 U' R f'","R' U' R f R' U R2 U' R f'","U' F R' U R' U' R U R2 U' F'"],
      "5": ["U2 F R U R' U' R U R2 U' R F'","R' U2 R U' R' F' U F U R","U2 R' U2' R U R' U' R U' r' R U' R' U r","R' U2 R U f R f' R' U' R","U2 R' U2 R U R' U' F' U F U' R"],
      "6": ["R' U2 R U R' F R' F' R2","U' R' U2 R' F R2 U R' U' F' R","U' R' U2 R U R' U2 F' U F R","R' F' U' F U2 R U2 R' U' R","R' U' R' F R F' U2 R U R' U' R"],
      "7": ["U' R' U R r' U R U R' U' r","U' R' U2 S' R U R' S U' R","U' R' U' S U' R U R' S' U' R","R' U2 R U' R' F' U2 F R","R' U R' F R F2 U F U R","R2 F R F' U R f R2 f'","R' F' U' F U F' U2 F R","U' r' U2 R U R' U' R U2 r R'","f R' U R' U' R f' U R' U' R"],
      "8": ["U' r D r' U2 r D' r2' U R U2' R' U' r","R' U2 F2 r U r' U F R","U' R2 F2 r U' R U2 r' U2 F R","R' U R' F R F2 U2 F R","U' R' U2 R U R D r' U r D' R2 U' R","R' U F' U L' U L F R"]
    },
    "19": {
      "1": ["U2 F U R2 U' R2 U R2 U' F'","R' U R U' R' U R' F R F' R","R' U R U' f R' f' U R' U R"],
      "2": ["U' R' U' F R' F' R F R' F' R2","U' R' U' r U R' U' R U R' U' r' R2","F R U R2 U' R F' R' U' R"],
      "3": ["r' R U' R' U2' R U R' U' r","R' U F' U F R U' R' U R","U' S R' U2 R U R' U' R U' S'","R' U R U' R' U R f R2 f'","R' U' R U R' U' R f R f'","R' U' F' U' F U' R U R' U' R"],
      "4": ["R' U l R U' R' U l' U R","U2 R' U' F' U F U' R U' R' U R","U' R' U' r U R' U' r' R2 U R' U' R","U' R' U' R U R' U' F R U R' U' F' R","U2 R' U' R U' l U' R' U l' U R"],
      "5": ["U' l U2 R' F U' F' R U2 l'","U2 R U2 R' U S R' S' R U R'","U S R' U R2 U2 R' U2 R' U' S'"],
      "6": ["U2 R' U' F' U F2 R' F' R2","U' r U' r2 U r2 U r' U r' U' r","R' U r U' r' U2 r U r' U' R"],
      "7": ["U f R2 U R2 U' R f'","U' R' F2 r U r' U F U2 R","U2 R' F U2 r U2 r' U2 F' R","r' U' r2 U' r2 U' r2 U r2 U r","U' R2 D' r U' r' D R U2 R U R' U' R"],
      "8": ["R' U' R U' r' U r U2' r' U' r","U2 f U R' F R' F' U' f'","R' U' R U' f U R2 U' f'"]
    },
    "20": {
      "1": ["U2' R' U2 R U' R' U R"],
      "2": ["R' U R U' R' F' U2 F R","U2 R' U' R U R' F' U' F U' R","R' U R U' r' U R U2 R' U' r","U2 R' U2 R U' R' F R' F' R U R","f R' f' U' R' U' R U R' U' R","U2 R' U2 R U' f U R U' f'"],
      "3": ["U' S' U' R' U2 R U' R' U R S","U2 R' U l' U R U' R' U R U' l","U2 r' U2 R U' R' U R U' M'","U2 R' U2 R U2 R' U F' U F R","f R2 f' U R' U R U' R' U' R","U2 R' U2 R U' S' R' U R S","R' F' U L' U L U' F U R","U f U R U' R' U R U' R f'","U R' U' R U R' U2 F' U F U' R"],
      "4": ["r' U R U R' U' r U' R' U R","R' U R U' R' F' U F U R","R' U R U f R f' R' U' R","U f R' f' U R' U' R U' R' U R","U f R2 U R' U' R U R' U' R f'","r' U R U R' U' R U2 R' U2 r"],
      "5": ["R' U' R' F R F' U R' F R F' R","R2 D' r U r' D F R F' R","U2 R' U2 R U' R' F' U F R","U R' U' R U2 r' U R U2 R' U' r","R2 F R F' U R U2 R' U' R","U' R' U F' U F R U2 R' U' R","R' F' U2 F U2 F' U2 F R"],
      "6": ["U' R' F' U' F U R U' R' U' R","U R' U2 R U R' F R' F' R U2 R","U' R2 D' r U r' D R U R' F R F' R","f U R' U' R' f' R' U' R","R' F' U r' F2 r U' F R","U2 R' U' R f R f' R' U' R"],
      "7": ["U2 R' U2 R2 r' U' R' U r","U2 R' U' F R' F' R2","U2 R' U2 S' R U' R' S U R","U2 R' U2 R2 f' U' f","r' U R U R' U' R U' R' U r","R' F' U2 F U' R U2 R' U' R","U R' U2 F' U2 F U' R"],
      "8": ["R2 F R F2 U2 F R","R' F' U r' F r F R","U' R' U2 R' D' r U' r' D R2 U2 R' U' R","R' U F2 r U r' U F R"]
    },
    "21": {
      "1": ["U' r' U r U r' U' r U2 R' U' R","U' f U R U' f' R' U R","U' F U R U' R2 U R2 U' R' F'","U r' U' r U' r' U' r U r' U r"],
      "2": ["U R' U' R f R f'","U' r' U r U' r' F' U' F r","U' r2 F r F' r' D' F' D r2","R' F' U' F U' R U R' U' R","U R' F R U R' U' F' U' R"],
      "3": ["U' F U R U' R' F' R' U R","U R' U' R S U' R' U R S'","U' R2 F R F' U2 R U' R' U' R","U' R' F2 r U r' F R U R' U R"],
      "4": ["U S' R' U' R S U' R' U R","U2 R U R2 F' U' F R2 U' R'","U2 r U R' U' r' U' R U R U' R'","U2 r U' r2 U r2 U r' U' r' U' r","f U R U' R U R U' R' f'","R' U2 R f R2 f' R' U' R","R' U2 R U' R' U R' F R F' R","U R' F' U2 F U' R U' R' U R"],
      "5": ["U' r' U r U2' r' U' r","U' f U R2 U' f'","U' R' F' U r' F r F U R"],
      "6": ["f U R U' R f'","U' r' U r U2 r' U2 F' U F r","U' R2 D' r U' r' D R U R U2 R' U' R","U' r' U r U2 r' U2 r' D' r U r' D r2"],
      "7": ["U R' U' R S R U R U' R' S'","U' r' U r U2 r U' r2 U' r2 U r'","U' r' U r U2 r' U R U R' U r","f U R U' R2 U R' U' f'","U' f U R U' R' U R U' f'","U' f U R' U' R' U R U' R' f'","U R2 F R F' U2 R' F R F' R","U2 R' F' U r' F' r U F U R","U R' U F' r' F2 r U' F U' R"],
      "8": ["R' U2 r U' r' U2 r U r' U' R","U' r' U r U' r' F' U2 F U r","R' U2 F' r' F2 r F U' R","R' F' U2 r' F r F U' R","U2 R' F' U r' F' r U2 F R","U R' F' U2 F2 R' F' R2"]
    },
    "22": {
      "1": ["U R' U' R U' R' U R"],
      "2": ["U' R' F' U F U R","U f R f' R' U' R","U2 R' U F R' F' R U2 R"],
      "3": ["U R' F R' F' R2","U R' U' R R r' U' R' U r","f' U2 R' U' R U' f","U R' U' R2 f' U' f","U R' F' r' F r F U' R"],
      "4": ["U' R' F U R U' R' F' U2 R","U2 S' U R' U R U2 R' U' R S","U' R' U R U2 S' R' U' R S","U' r' U r' U r2 U r2 U' r U' r","f R f' U R' U2 R U' R' U R"],
      "5": ["U2 R U R' U' R' U' F R F'","U' r' U R U2' R' U' r","U' R' F' U2 F R","U R' U' R U' R' F' U F R"],
      "6": ["U2 R' F' U' F U' R","U R' U' R U' f U R U' f'"],
      "7": ["S U R' U' R U' R' U R S'","U' R2 F R F' R U' R' U' R","U' F R' F' U2 R U R U' R'","U R' U' R U' S' R' U R S","U' R' F' U' F U F' U' F R"],
      "8": ["U' R' F' U2 r U' r' F2 R","R' F2 r U r' U F R","R2 D' r U r' D R2 U2 R' U' R","R' U' F' U L' U L F R","U' R' F' U2 r' F r U' F R"]
    },
    "23": {
      "1": ["R' F R' F' R2 U' R' U R","U S R' F R' F' R2 S'","f U R2 U' R' U R' U' R f'","f R2 f' U R' U2 R U' R' U' R","U S R' U' R U2 R' U2 R U S'"],
      "2": ["U' R' U R U' r' U R U' R' U' r","U2 F R U R' U' F' R' U' R","U R' F' U' F U' R U' R' U R","U' R' F' U' F U2 R U' R' U' R"],
      "3": ["R' U' R U' R' U R' F R F' R","U F R' U R U' S R f'","U2 f U R' U' f' R' U' R","U' R2 F R F' U R U' R' U' R","U S R' U' R U' R' U R U2 S'","R' U' R U' f R' f' U R' U R","r U2 R' U' R U' r' U R' U' R","R' U' r U' R' U2 R U r' U' R","U2 R' U' F' U' F U' R U' R' U R","U R' U' R U R' U R U' f R f'"],
      "4": ["U R' F' r U' r' F2 U' R","R' U' F' U F R U' R' U R","F U R U' R' F' U2 R' U' R","U' S U' R U2 R' U2 R' U S'","U S R' U' R2 U R U' R' U S'","U R' U' R' U' F' U F R2","U2 f R U R' U' f' R' U' R","R' U R U R' U' R f R f'"],
      "5": ["R' F R' F' R U F R' F' R2","U' S R' U R U' F R' f'","U' r2 F' D' r U2 r' D F r2","R' U R U' r' U r U2 r' U' r","U2 R U2 R' U' S R' S' R U' R'","U R' F' U F U' R f R f'"],
      "6": ["R' U' r U' r' U2 r U r' U' R","U' r' U' R U' R' U' r U r' U' r","R' U' F' r' F2 r F U' R","U' f U R' F R F' U' R' f'"],
      "7": ["U2 S' U S R' U R U' F R' F'","U' R' U2 R2 D r' U' r R' U2 R D' R'","U' R2 D' r U r' D R U R U2 R' U' R","R' U R f U R U' R f'","U2 f R' U R' U' f' R' U' R"],
      "8": ["U' R' U R2 D r' U' r R' U' R D' R'","U' R' U' R U' R' U' R2 D r' U r D' R'","U' S U2 R' U R2 U2 R' U2 R' S'","U S' R' U' R S f R f'","U2 R' U' F' U F U' R f R f'","U' f U R' F R F' R' U' f'","U2 R' F' L' U' L U' F U' R","R' U' F' U' F U' R U' f R2 f'"]
    },
    "24": {
      "1": ["U' R U R' U R U2 R2 U2 R","U F U R' U' R F' R' U' R","R U R' U R U2 R2 U R"],
      "2": ["S R' F D R D' R' F' R2 S'","U' F R U R U' R2 U R2 U' F'","S U F R F' R' U' R S'","U2 R' U2 S R U' R' U S' R","U' R U2 R' U' R U' R2 F R' F' R2","U2 R' U R' F R F' R U2 R' U' R","U r' U r U' r' U' R U' R' U r","U' R' F R' F' R2 U' R' U R U2 R' U' R","R U R' U R U2 R2 F' U F R","U2 R' U r R' U R U' r' U R","U R' U' R U R' U F' U F U' R"],
      "3": ["U' R' U' R U' R' U F' U2 F R","U F R' F' U F R F' R' U' R","R' F' U F R f R f'","U2 R' U R U R' U2 F R' F' R2","U R' U' r U' r' U' r U r' U R"],
      "4": ["U R U2 R2 U' R U' R' U' F R F'","F U R U' R' S R2 f'","U' R' U' R U' R' U R U2 R' F R' F' R2","U R' U R U R' U' R' F R F' U2 R","U2 l U' R' U l' U' R U R' U2 R","F U R U' R' F' U' f R' f'","U f U R F R' F' U' R f'","R' U' F' U F R f R f'"],
      "5": ["U2 x' U' R U l' U' R' U' R","U' R2 F R F' U' R U' R' U' R","U' R' U S R' F R f' R","U' R' U F' U' F R U2 R' U' R","U f U R' U' R f' R' U' R"],
      "6": ["U' R' U2 R U' r' U R U R' U' r","U' R' F' U' F R U' R' U' R","U R' U l U' R U l' U' R' U' R","U2 F R U R2 U' R F' R' U2 R"],
      "7": ["U r' U' R U r R' U2 R' U R","U R' U2 r R' U R U' r' U R","S U R' U' R S' U' R' U R","U R' U' S R U' R' U S' R","U' R' F' r U' r' F2 R U2 R' U' R","U r' U r U' r' U' r U' R' U R","U2 R' U2 r U' r' U' r U r' U R","R' U F' U F R f R f'"],
      "8": ["U' R' F' U r' F' r U F R","U' r' U r U' r' R U r R' U2 r' U' r","U' R' U r U' r' U2 r U' R' U' R U' r' R","f R U R' U' R f' R' U' R"]
    },
    "25": {
      "1": ["U' R' F' U F R U' R' U' R","F R2 U R2 U' R2 F'","U2 L' E L U' L' E' L","R' S' R U R' S R","U R' U R U R' F' U' F R"],
      "2": ["U R' U l U' R U l'","U' R' U2 F' U F U2 R","R' U R' F' U' F U R2","U R' U' R' r U R U' r' R","U R' U R U R2 F R F' U' R","U' R' U2 R U2 f R f'","U' R' U2 R S' R' U2 R S","F U R U' R U R' U' R2 F'","f R' U R U' R U R' U' R f'"],
      "3": ["U2 R U R U' R' U F R2 F'","r' U' r R' U2 r' R U' r","U' F R' F R D R' D' F2","U2 r' U' r U2 r' U' r U2 r' U r","F R' S R2 S' R' F'","U f R2 U R U' R2 f'","U R' U R U2 f R2 f'","U R' U R U f R' f'"],
      "4": ["l' D' R' U R U' D l","U2 R U2 F R' F' U2 R'","U R' U R U2 R2 F R F' R","U2 r2 U' F' U F r U' r","U R' U R U R' U' F' U' F R","U R' U' R U f R f'"],
      "5": ["U2 R D R' U' R r' U r D' R'","f R2 U R2 U' R2 f'","S R' S' R U R' S R S'","f U R U' R f' U2 R' U' R"],
      "6": ["U2 R D R' U R r' U' r D' R'","F U R F R2 F' R' U' F'","U2 S R' S' R U' R' S R S'","U R' U' r U' r' U2 r U r' R","U' R D r' U' r R' U R D' R'","r' U' r U2 r' U2 r U2 r' U r","R' U' R2 D r' U' r D' R2 U2 R"],
      "7": ["U2 R D r' U' r D' R' U R' U' R","U f R2 U R U' R' U R' U' f'","U R' U R U2 f R' U R' U' f'","U' R' r U' r' U2 r U r' U R","U2 f R U R U' R' f' R' U2 R","U R' U R U f R' U R U' R' f'"],
      "8": ["U R' U' R' D' r U r' D R2","R' F' U' F U2 R U f R' f'","r' U' r U2 r' R U R' U2 r","R' U R U' f R U R' U' R f'","U R' U' R U f R2 U R' U' f'"]
    },
    "26": {
      "1": ["U' R U R U R U' R' U' R'","U' S' R' U R U f R' F'","R U' S' U2 S U' R'"],
      "2": ["l U' R' U l' U' R","U' R' U F U R U' R2 F' R2","U' R2 U' R F R' F' U R2","r' R U' R' U r R' U' R","U2' R' F R' F' R2 U2 R' U' R","U' f R f' R' U R U' R' U' R","U2 f R2 U R' U' R2 f'"],
      "3": ["R' F' U F U R U' R' U' R","R' U2 F' U' F U2 R","U r' U r R' U2 R r' U r","U R2 U' F' U F R U' R","f R' f' U' R' U R","U' R U2 F R F' U2 R'","U' R U2 F R F' R' U' R U' R'"],
      "4": ["U' F R2 F' U' R U R' U' R'","U' r' U' r U2 r' U r U2 r' U r","U' R' S' U' F' U f R","f R f' U' R' U' R","U' F D R D' F' R U' R'","U' R2 U' R f' R' U R f R","R' U' F' r' F' r U F R","r' U r U r' R U' R' U' r","R' U2 R' F' U' F U R U R"],
      "5": ["U r U R U R' U' R' U' r'","U' r' U2 R U' R' U2 R U R' U2 r","U R' U2 F' U2 F U2 R","f U R2 U' R2 f' U2 R' U R","U R' U2 R U' f R2 U R2 U' f'","U' r' U' r U2 r' U' R U2 R' U r"],
      "6": ["U' r U R U R U' R' U' r'","U2 F R2 U R' U' R2 F'","U R U2 F R2 F' U2 R'","U' S' R' S U' S' U R S"],
      "7": ["U' F R2 U R U' R2 F'","U r' U r R' U R U r' U r"],
      "8": ["U2 R2' D' r U' r' D R U R","R' U2 F' U' L' U L U F U R","U' r' U2 R U' r R' U2 r' U r","U f U R U' R2 f' U' R' U R","U' S R' U' R U S' R f' U' f","U' r' U' r U2 r' U' R U R' U2 r","f R' U R U' R' f' U R' U' R"]
    },
    "27": {
      "1": ["U R' U' F R U R' U' F' R","U2 R' U' R U r' U' R U M'","U2 R' U' R U f' U f R'","f U R' U' R2 U R' U' R f'","U S R' U' R U S' R' U' R","U2 R' U' R f U R' U' R f'"],
      "2": ["U2 R' U' R r D r' U r D' r'","U' R' F' U' F R U R' U' R","R U R' U R' U2 R' F R2 F'","U2 R' U2 R U R' U' R' F R F' R","U2 R' U' R U' f R2 f'","U2 R' U2 R U' R' F' U' F R","R' U' R f R f' U R' U' R"],
      "3": ["U2 R' U2 R' F R F' R","U' R' F' U2 F R U' R' U R","U' R' U' F' U' F R U' R' U R","U2 R' F' r' F' r F U' R","U2 R' U' R U2 R' F' U' F R","U2 S' R' U' R S U R' U' R"],
      "4": ["l' U R' U' R U R' U' l R","U2 R' U2 R U' r D r' U' r D' r'","U2 R' U' R U' R2 F R F' R","U2 R' U2 R f R2 f'","R' U' F' U F U' R U R' U' R","R' U2 F' U2 F U R U R' U' R","U S R' U' R U R' U' R U S'"],
      "5": ["U2 R' U' R2 D r' U r D' R'","U2 r' U r U2 r' U' r U' R' U R","U' R' U' R f R2 U R' U' R f'","U f U R2 U' R f'"],
      "6": ["U2 R' U2' R U R D r' U r D' R'","f R U R U' R f'"],
      "7": ["U2 R' U2 F' r' F2 r U' F U R","U2 R' U2 F2 r U r' U F U R","U2 R D r' U' r D' R2 U2 R U' R' U R","U2 R' U2 R U' R' U R' D' r U' r' D R2","R' F' U' F2 R U R' U' F' R","R' U2 R U f R2 U R' U' R f'","U' f U R' U' R' U R' U' R f'","U R' U' R f R U R' U' R f'","U f R U R2 U' R U R' U' R f'"],
      "8": ["U2 R' U' R U2 R D r' U' r D' R'","U2 R' F' U' F R U' R2 F R F' R","U2 R' U2 F' r' F2 r F R","U' R' F' U2 r' F r F R","U2 R' U2 R f R' U R' U' f'","U' R' U2 R f U R U' R2 f'","U R' U' R U' f U R U' R2 f'"]
    },
    "28": {
      "1": ["U' R' U R U' R' U R"],
      "2": ["U' R' U2 R U2 R' F' U F U R","U' r D r' U r D' r' U2 R' U R","U' f R f' U2 R' U R","U' R' U2 R f R f' R' U' R","U' f R f' U2 R' U' R U R' U R"],
      "3": ["U R' F R' F' R U2 R","U R' F R' F' R2 U R' U R","U' R' U R U' R' F' U F R","R' F' U F R U R' U2 R","U' R' U R U' f R' f' R' U R","U2 f U R U' R2 U R2 U' f'","U' R' U R U' f R U R U' f'"],
      "4": ["U' R' U R U' R2' F R F' U R","U' R' U r U' R' U R U M","U' f R2 f' R' U2 R","U' R2 F R F' R' F R F' R","U' f U R U' f' U2 R' U R","U R' U F' r' F r F R","U' R' U R U' S' R' U R S","U' R' U R U2 R' U F' U F R","U R' U' R U R' F' U2 F R","f R f' R' U' R U R' U2 R"],
      "5": ["U' R' U2 F R' F' R2","R' F' U2 F U' R","U' R' U R2 f' U' f","U' R' S U R U' R' S' U R","U' R' U R U' f R' U R U' f'","U' R' U R U R' F' U F U' R"],
      "6": ["U R' U' F' U' F U' R","U2 r R2 U R U' r' U R","U r' U r U' r' U' r R' U2 R","U R' U2 f R' F' R S' R","U2 R2 F R F' R U2 R' U' R","U' S U' R' U R S' U' R' U R","U2 R' U S R U' R' U S' R","U f' U f R2 U R U2 R' U' R","U R' U R f R' f' U2 R' U' R"],
      "7": ["U R' U' R U' R' F R' F' R2","U' R' U R U' R' F R' F' R U R","U' R' U R U' f U R U' f'","U' R' U2 R U R' F' U' F U' R","U R' F' r' F' r U F U R","U' f R2 U R U' R' f' U2 R' U R"],
      "8": ["U R' F' r' F' r U2 F R","R D r' U r D' R' U2 R' U R","U R' F' L' U2 L F U2 R","U' f R2 U R' U' f' R' U2 R","U' f U R U' R f' R' U2 R","U' f R U R' U' R f' U2 R' U R"]
    },
    "29": {
      "1": ["U' R' U' R U R' U' R"],
      "2": ["U' R' U' R U R' U2 F' U F R","U' R' U' R' F R2 U R' U' F' R","U2 R' F R U R' U' R U R' U' F' R","U f R' f' R' U' R","R' U2 R U2 S' R' U' R S"],
      "3": ["U' l R' U' R U R' U' R U l'","U' r' U' R U R' U' R U M'","U' R' U' R U S' R' U' R S","S' R' U2 R S U2 R' U' R","U' R' U' R U R' U' F' U' F U R","U f R2 f' R' U' R U' R' U R","U2 f U R' U' R U R' U' R f'"],
      "4": ["R' U R U' R' F' U' F U' R","U2 f U R U' R' U R2 U' R f'","f R f' U2 R' U2 R U' R' U R"],
      "5": ["U R2 F R F' U2 R","R' U F' U F U R","r' U' R U r R2 U' R","f' U f R2 U' R","f U R' U' f' U R' U' R"],
      "6": ["R' U R U2 l' U R' U' l R","U' R' U' r U R' U' r' R2","U' R' S U' R U R' S' U' R","U' R' U' r U' r' U r U r' U' R"],
      "7": ["R' U' R' F R F' R U R' U' R","R' U F' U2 F R","U' R' U' R U' r' U r U r' U' r"],
      "8": ["U R' U F' U L' U' L U F R","U R2 F R F' U F' U F R","U' R' U' R U R D r' U' r D' R2' U' R","R' U F' U2 L F' L' F2 R","R' U F' U2 L' U L U' F R","f R U R' U' R' f' R' U' R","S R U R' U' R' S' R' U' R"]
    },
    "30": {
      "1": ["R' F U R U' R' F' U R","U2 r' R U' R' U r U' R' U R","R' U R S U' R' U R S'","U f R' U R U' f' R' U R","U2 f R f' U' f R f'","f R U R' U' R' U R2 U' f'","U S R' U R U' S' R' U R"],
      "2": ["R' F U R U' R2 F' R U R","R' U2 F R U R' U' F' U' R","R' U R f R f'","R' U R U2 S' R' U2 R S"],
      "3": ["U2 l U' R' U R U' R' U R l'","U2 R' U R U R' F R' F' R U' R","U f R' U R U' R' U R U' f'","U2 R' U F' U F R U R' U' R","U f R' U R U' R f' R' U R","R' U R U' R' U2 R U f R' f'"],
      "4": ["R' U' F' U F U R U' R' U R","U2 R' U R2 D r' U r D' r' U' R' U r","S' R' U R S U' R' U R","U' R' U' R U f U R' U' R' f'","U' R' U' R U' R' U' R f R f'"],
      "5": ["U R D r' U' r D' R2 U R","U2 R' U R' D' r U r' D R2 U' R' U R","U f R' U R' U' R' f'","R' U R f R2 U R' U' f'"],
      "6": ["U r D r' U' r D' R2' U R U' r' R","R' U R U2 f R U R' U' R' f'","f R2 U R U' R U R' U' R' f'","U' R' U R f R' U R2 U' R2 f'","f R' U R2 U' R2 f' U2 R' U' R"],
      "7": ["U' R' U' R U r' U r U2' r' U' r","U f R' U R2 U' f'"],
      "8": ["U2 R' U R2 D r' U r D' R' U' R' U R","R' U R f R U R U' R' f'","R' U R S R U R U' R' S'","U R' F' U' F U' F R' F' R2"]
    },
    "31": {
      "1": ["U' R' U R' F R F' R","U' R' U R U' r' U r U' r' U' r","U' R' U' r U' r' U' r U r' U' R","f R2 f' R' U' R","U' f R' f' R' U2 R","f U R U' f' U' R' U R"],
      "2": ["f R f' R' U' R U' R' U R","U' R' U R' F' r U' r' F2 R2","U' R' U R U S U R' U' R S'","U' R' U2 R U2 R2 F R F' U' R","U' R2 F R F' R' F R F' U' R","R' U r U2 R' U' R U' r' R","U' R' U R U' R2 F R F' U' R","U' R' U R U2 r' U' R U r R'","U' R' U2 R U r' U' R U r R'","U' R' U R U' R' U F' U' F R","U' R' U2 R U l R' U' R U l'","U2 f' U R' U R U' f R'","U' f R2 f' U2 R' U R","U' R' U R U2 f' U f R'"],
      "3": ["l U' R' U l' U R","U' R' U R U' R' F' U' F R","U' r' U R U' R' F' U' F r","U' R' U R U R' U' R' F R F' R","R' U F R' F' R2 U' R' U R","U' R' U2 R U2 f R' f'"],
      "4": ["R' F' U F R U' R' U R","U' R' U2 R U' R2 F R F' R","U' r' U r U r' R U R' U' r","U' r' U R U' r R' U' r' U' r","U' R' U R U' f R' f'","U2 R' U' F R U R' U' F' U' R"],
      "5": ["U' r' U R U R' r U r' U' r","U' R2 F R F' R U R2 F R F' R","f R f' U2 R' F' U2 F R","U' f R' U R' U' f' R' U2 R","U f U R U' R f' R' U' R","U f R2 U R' U' f' U R' U' R","U2 f U R2 U' R f' U R' U R"],
      "6": ["U' R' U2 R2 D r' U r D' R'","U' R2 F R F2 U' F R","R' U2 R f U R U' R f'","U' R' U F' r' F' r U' F R","U' R' U F' U r' F2 r F R"],
      "7": ["U' R' U R U R D r' U r D' R'","R' U2 R U' r' U r U2 r' U' r"],
      "8": ["U' r' U r U' r' R U' R' U' r","U' R' U R U' R D r' U' r D' R'","R' F' r' F2 r F U' R","f U R U' R2 f' U' R' U' R","r' R U' R' U2 r U r' U' r"]
    },
    "32": {
      "1": ["R' U' R U R' U' R U' R' U R"],
      "2": ["U2 R' U F' U2 F U' R"],
      "3": ["f R' U R2 U' R f'","U' R' F' U' F U' R U' R' U' R"],
      "4": ["R' U' R U R' F R' F' R2","U R' U' F' r' F r F R","R2 F R F' U2 R U R' U' R","R' U' R f' U2 R' U' R U' f","R' U' R U R' U' R2 f' U' f","U R' U R U R' F' U2 F R","U R' U' r U' r' U r U r' R"],
      "5": ["U R' U F' U' F U' R","f' U f R' U R' U' R"],
      "6": ["U f R' U R U' R f'","U R' U2 F R' F' R U2 R","R' U' R U' R' F' U F U R","R' U' R U f R f' R' U' R","U R' U R U' f R f' R' U' R","U2 R' U F' U F R U R' U2 R","U R' U R U R' F' U F U R"],
      "7": ["f U R2 U' R U R' U' R f'","S U R' U F' U' F U' R S'","U2 R2 F R F' U2 R U' R' U R","U' R' U' R U' f R' f' R' U' R"],
      "8": ["R' U2 F' U L' U L F R","U' R' F' U L' U2 L F U R","U R' U' F' L' U2 L U' F R","U' R' F' r' F' r U' F U2 R"]
    },
    "33": {
      "1": ["R' U2 R U' R' U' R"],
      "2": ["U2 R' U2 F' U F U R","U2 R' S R U R' U' S' R","f R' f' R' U' R U f R f'","U f U R2 U' R2 U R U' R' f'","R' U2 R U r' U r U r' U' r","U2 R' U2 F' U F R U' R' U2 R","U2 R' U R U R2 F R F' U2 R","U' f R2 U R U' R' f' U2 R' U' R"],
      "3": ["U R' S R' F R f' R","U' r' S U' R U R' S' r","R' U2 R U' R' U2 F' U F R","U R' F' U' F R U2 R' U' R","R' U' R f R f' U2 R' U' R","R' U' R f R U R' U' R2 f'","R' U2 F' U2 r' F' r U F R","U2 R' U2 R U' R' F' U' F U' R","U' R' F' U' F U2 R U R' U2 R"],
      "4": ["U2 R' f R U R' U' f' R","U2 S R' U' R U2 R' U' R S'","U2 R' U' R U2 S' R' U' R S","R' U2 R U R' U' F' U F U R","U2 R' U R U f R' f' R' U' R","S' R' U R S R' U R U' R' U' R"],
      "5": ["f R U R U' R2 f'","R' U2 R U' S' R' U' R S","R' U2 R U' R' U' F' U' F U R","U R' F' U' F U' F' U F U R","S' R' U' R S R' U' R U' R' U' R","U F U R2 U' R' F' R U R' U' R'","R' U2 R U' R' U2 R' F R F' U R"],
      "6": ["U2 f R' U R' U' R f'","U r' S R' F R f' r","R' U2 R U R' U' F' U2 F R","U2 S' R' U' R S U2 R' U' R","S R' U2 R U' R' U' R U' S'","R' U2 R U' S R' U' R U S'","U2 R' U' R U2 R' U2 F' U F R","U r' R U' R' U2 R U' R' U' r","U2 r' U' R U r R' U R' U' R","U' R' U' F' U F U2 R U' R' U' R"],
      "7": ["U f U R2 U' R2 f'","U2 R' U2 F' U2 F R","U R' U2 R' F R F' U2 R","U' R' S U' R U R' S' R","U2 R2 F R F' R U R' U' R","f R U R U' R' U R' U' f'","r' R U2 R' U' R U2 R' U' r","U R' U' F' U' F R U' R' U' R","R' U' R U' R' U F' U' F U2 R"],
      "8": ["U2 R' F' U' L' U L U' F U R","U R' U' F' U L' U' L U F R","S R U2 R U' R' U' R' U' S'","U' R' S R S' R' U' R S R' S' R","U R' U2 R' F R F' U F' U F R"]
    },
    "34": {
      "1": ["R' U R U2 R' U R"],
      "2": ["R' F' U F U F' U F U2 R","U2 R2 F' U' F U F R F' R","R' U R f' R' F U' F' R f","U R' F' U2 r' F r U F U R","U R' U' R U' f R2 f' U R' U' R"],
      "3": ["f R2 U R' U' R' f'","R' U R U2 R' F' U F R","R' U R f R f' R' U2 R","U' R' S R U' R' U S' R","U2 R' f U R U' R' f' R","f R2 U R U' R' f' R' U R","R' U2 R U R' F' U' F U2 R"],
      "4": ["R2 F R F' R U' R' U R","S' R' U R S U2 R' U R","U2 R' S U R U' R' S' R","f R' f' U' R' U R f R f'","S' R' U R U R' U2 R U S","U' f' U R' U R U2 f R' U R","U' f U R U' R2 U R' U' R f'"],
      "5": ["R' U F' U F U' R","R' U R U' R f' U' f","R' U S' R U2 R' S U R","f R2 U R U' R' U R U' f'"],
      "6": ["U2 R' U' F' U' F U2 R","f U R F R' F' U' f'","S R' U R U2 R' U R S'","R' U R U2 S' R' U R S","R' U R U R' U F' U F R","R' U R U2 R2 F R F' U R","U2 R' F' U2 F R U' R' U' R","U2 R' U' F' U' F R U R' U R","R' U R U2 R' U F' U' F U R","U2 r' U r U' r' U' r R' U R","R' S R U R' U2 R U R' S' R","U f U R U' R U R' U' R' f'"],
      "7": ["f R2 U R2 U' f'","U R' F' U2 F U2 R","S R' U R U' F R f'","R' U R U2 f U R U' f'","U R' F' U2 F R U R' U R"],
      "8": ["f U R F R' F' R U' R' f'","U' S U R U R U R' U2 R' S'","r' U' r U2 r' R U' r R2 U2 R","U2 R' U' R' D' r U r' D R U R","U2 R' S R S' R' U R S R' S' R"]
    },
    "35": {
      "1": ["U R' U F R U R' U' F' R","U' R' U r U' R' U' R U r' U2 R","U f R f' U' R' U R"],
      "2": ["U' R' U' R2 U2 F R' F' U2 R'","R' F' U F U2 R U R' U' R","U R' U2 R U R' U2 R' F R F' R","U2 f R f' U R' U' R"],
      "3": ["U R' F' U F U R U R' U' R","R' U' R r' U R U' R' U' r","R' U r U' r' U r U r' U R","U f R' f' U' R' U' R","R' S' R U' R' S U' R"],
      "4": ["U2 R' F' U F U' R U R' U' R","U' r D r' U2 r D' r' R' U' R","U' R' F' U F U' F R' F' R2","U' R' F R' F' R U R U' R' U' R","U' R' U' S' R U' R' S R","U2 R f' U R' U' R U' f","F U' R' U' R U S R' f'","U R f' U' f U2 R' U' R","f R f' R' U R U R' U' R","f R' U R U' f' U' R' U' R","R2 F' R U R U' R' U' F R"],
      "5": ["U' R' U' R2 D R' U r' R U' r D' R'","U' r' U r R' U R r' U' r U r' U r","f R' U R F R' F' R' U' f'","f R U R' U' R' f' U' R' U' R","U R' U R U' f U R U' R2 f'","U' f R U R' U' R f' U R' U' R"],
      "6": ["U' R2 D' r U' r' D R U' R","f R U R' U' R f' U' R' U R","r' U r U' r' U F' U' F U2 r","U R D r' U r D' R' U R' U' R"],
      "7": ["U' R' U' r' R U2 F' U' F U2 r","U' R' U R' D' r U' r' D R2 U' R' U' R","U' R' U' R2 D r' U r D' R' U' R' U' R","R' U' r U' r' U2 r U' R' U2 r' R2","U2 f R' U R U' R' f' R' U' R","R' U' R U2 f R U R' U' R f'","U R' U R f R U R' U' R f'"],
      "8": ["U R2 D' r U r' D R2 U R' U' R","R2 F R F' U F' U F U2 R","R' U' R U f U R U' R2 f'","U2 f R2 U R2 U' R2 f' R' U' R"]
    },
    "36": {
      "1": ["R' U' R U' f R f'","R' F R' F' R U' R","U' R' F' U F R U R' U' R","U S R' U R U' S' R' U2 R"],
      "2": ["U R' F U R U' R' F' U' R","U R' U' R U f R' f'","U R' S' R U R' S U R"],
      "3": ["U R' U' l U' R U l'","U R' U' R r' U' R U M'","U2 R2 U' F' U F R U2 R","U' r D r' U r D' r' U' R' U R","U S' R' U' R U f R' F'","R' U' R U f R U R2 U' f'","R' U' R U' S U' R' U R S'"],
      "4": ["U R' U' R U r' U r U' r' U' r","U R' U' R U R' U' F' U' F R","U2 r D r' U' r D' r' U R' U R","U R' U' R U2 R2 F R F' R","U' R' F R' F' R2 U R' U2 R","U R' U R U f R f'","S R' U' R U S' R' U2 R","U' f U R U' f' U R' U' R","U R' U' R U f U R' U' f'"],
      "5": ["U R' U R' D' r U r' D R2","U S' R' U' R U2 f R2 F'","U S' R' U R S U f R f'","U R' U R U f R2 U R' U' f'","U r' U r U' r' U2 R U r R'","U r' U r U2 r' U' r U2 R' U R"],
      "6": ["U' R2 D' r U r' D R2 U' R' U R","U R' U r U' r' U2 r U r' R","R' U' R U f R U R' U' R' f'","U R' U R U' f R U R' U' R' f'"],
      "7": ["U2 R D r' U' r D' R2' U2' R","R' U2 R U' f R' U R U' R2 f'","R' U' R U' f R U R U' R' f'","U' R' U' R U' f R' U R2 U' f'","U2 f R U R' U' R' f' R' U2 R","U R' U' R U2 f R' U R' U' f'","R' U' R U' S R U R U' R' S'"],
      "8": ["U' R D r' U r D' R' U' R' U R","U R' U' R U' R D r' U r D' R'","R' U' R U' f R2 U R' U' f'"]
    },
    "37": {
      "1": ["U' R' U r R U2 R2 U' R2 U' r'","U' F R' U R2 U' R' F' R' U' R","U2 f R' f' U R' U2 R U R' U2 R","R' U R F R U R2 U' R F'","U2 R' U R' F R F' U R U R' U2 R","U2 R' f' U' F U R U2 R' S R"],
      "2": ["U' r' U r R' U' R U' r' U r R' U' R","U2 f R' f' U R' U2 F' U F U' R","U' R' U R U' f R2 U R' U' R f'","U2 f R2 U R2 U' R f' U' R' U R"]
    },
    "38": {
      "1": ["R' U R U' R' U2 R U' R' U R"],
      "2": ["R' U2 F' U F R U2 R' U' R"],
      "3": ["f R' U R R U' R' U R2 U' f'","U' f U R2 U' R' U R U' R2 f'","R' U2 F' U F U' F' U F U R","U2 R' U R U' R' U' F R' F' R2","U R' U F' U' F U R U' R' U' R","U2 f' U f R' U R' U R U' R' U' R"],
      "4": ["R' U' R' D' r U' r' D R2 U2 R' U' R","R' U R U R2 F R F2 U2 F R","R' U' F' r' F r U' r' F r F R","R' U R U R' F' U r' F r F R"]
    },
    "39": {
      "1": ["R' U' R U R' U2 R U R' U' R"],
      "2": ["R' U R U R' U' F' U F U' R","U f U R2 U' R U R2 U' R f'","R' S U R U' R' U R U' R' S' R","R' F' U' F R U R' U2 R U R' U' R"],
      "3": ["f R2 U R' U' R U R' U' R' f'","U R2 F R F' U R U R' U' R","U R' U R U2 R' F' U' F U2 R","r' U R U R' U' F' U F U' r","r' U' R U r R2 U2 R U R' U' R","U' f R2 U R' U' R U R2 U' f'"],
      "4": ["R' F' r' F' r U' F R U' R' U' R","R' F' r' F' r U r' F' r F U R","R' U S R U R' U' f' U F U' R","R' U' R U2 R' U F' U r' F r F R","R' U R U2 R2 D' r U r' D R U R"]
    },
    "40": {
      "1": ["U R2 F' U' F U R U' R","U' R' U2 F' U' F U R U R' U' R","U' R' U R' F R F' U2 R U' R' U' R","U' R2 F R F2 U F U2 R","U R' U R f U R' U' R' f'"],
      "2": ["U' R' U R r' U r U2' r' U' r","U' R' U R f U R2 U' f'","U' R' F' U2 F R f R f'","U' R' U F' U r' F r F U R","f R2 U R' U' R f' R' U' R"]
    },
    "41": {
      "1": ["U2' R' U R' U' F' U F R2","U' R2 U' R U' R' U2 F R F' R","U' f R U R U' f' R' U' R","U' f R' f' R' U R U2 R' U' R","U' R' U2 F' U' F U' R U' R' U R"],
      "2": ["U' r' U r U2 r' U' r R' U' R","U' f U R2 U' f' R' U' R","U' f R' f' R' F' U2 F R","U R' U R f R' U R U' R2 f'"]
    }
  },
  BL: {
    "17": {
      "8": ["U L U' F U' R U' R' F' L'"]
    },
    "18": {
      "8": ["U' L F U R' F R F2 U2 L'"]
    },
    "19": {
      "8": ["U L F U' R U' R' F' L'"]
    },
    "20": {
      "8": ["L U2 F U' R U' R' F' U2 L'"]
    },
    "21": {
      "8": ["U L U F U' R U' R' F' L'"]
    },
    "22": {
      "8": ["U' L F U' R U R' U2 F' L'"]
    },
    "23": {
      "8": ["U2 L F U' R U R' U' F' L'"]
    },
    "24": {
      "8": ["U' L F R U R' U F' U L'"]
    }
  }
};
