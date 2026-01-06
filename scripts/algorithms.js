var zbllAlgs = {
    // For T cases
    "T": {
        // BBFF
        "2GLL": {
            "AsA": [
                "(U) (R U2 R') U' R U' R2 U2 (R U R') U R",
            ],
            "OsC": [
                "(U') (R' U2 R) U (R' U R) U' (R' U' R) U' (R' U2 R)",
                "(U) (L' U2 L) U (L' U L) U' (L' U' L) U' (L' U2 L)"
            ],
            "OxC": [
                "(U') (R' U2 R) U2 (R U2 R') U' (R U' R' U) (R' U R)",
                "(R' U' R2 U R2 U R2 U2 R' U R' U R)",
            ],
            "CsC": [
                "R U R' U R U2 R' U2 R' U' R U' R' U2 R",
                "(U') R U R' U' R' F D' R U R' D R2 U' R' F'",
                "(U2) L' U' L U' L' U2 L R U R' U R U2 R'",
            ],
            "CsA": [
                "R U R' U R U2 R' U' R U2 R' U' R U' R'",
                "(U) R' U R U2 R' U' R U2 R' U' R U' R' U R",
            ],

            "CsO": [
                "(U') (R U' R') U2 (R U R') U2 (R U R') U (R U' R')",
                "R' U' R U' R' U2 R U R' U2 R U R' U R",
            ],
            
            "OsA": [
                "(U) (R U2 R') U' (R U' R' U) (R U R') U (R U2 R')",
            ],
            "CxO": [
                "(U) R U' R U2 (R U2 R') U (R U R' U') R' U R'",
                "(R U R') U (R U' R' U) R' U' R2 U' R2 U2 R"
            ],
            "AsC": [
                "(U') R' U R' U2 R' U2 (R U' R') U' R U R U' R",
                "(R' U' R) U' (R' U R) U' R U R2 U R2 U2 R'",
                "(U) R' U R2 U R' U (R' U' R) U' (R' U' R) U (R U' R')",
                "(U2) (L' U' L) U' (L' U L) U' L U L2 U L2 U2 L'",
            ],
            "OsO": [
                "(U) x D' R' U R D R2' D2 R U' R' D2 R l",
                "(U') x' D R U' R' D' R2 D2 R' U R D2 R' l'",
                "R U R' U R U' R2 U' R' U' R U R' U' R2 U2 R",
                "(U) (R' U R) U2 (R' U' R) U' (R U R' U') (R' U' R) U (R U' R')",
            ],
            "AsO": [
                "(U) (R U2 R') U2 (R' U2 R) U (R' U R) U' (R U' R')",
                "R U R2 U' R2 U' R2 U2 R U' (R U' R')",
            ],
            "OxO": [
                "(U') R' U2 R U R' U R2 U2 R' U' R U' R'",
	            "(U) L' U2 L U L' U L2 U2 L' U' L U' L'",
            ],
        },
		
		// FBFB
        "Diag": {
            "AsO": [
				"R U' R' U R U R' U' R U R' U R' D' R U R' D R",
				"F U' R2 U R' U R U2 R2 U' R U2 R' F'",
				"R' U D' R U2 R' D R' U' R U2 R' U' R2",
				"y R D R' U R D' R' U R' U R U' R' U R U R' U' R",
				"y' L2 F' L' U' L' U L F' L' U2 L U2 L F2 L2",
				"R' U R U2 R' D R' U' R U2 R' U' R D' R",
				"y' R2 F2 R U2 R U2 R' F' R U R' U' R' F' R2"
            ],
            "OsO": [
                "y R' U' R U R' U' R2 D R' U R D' R' U2 R' U R",
				"R' U' R U R2 D' R U2 R' D R2 U2 R' U2 R",
				"R2 D' R U' R' D R2 U' R' U R' D' R U R' D R2",
				"y' R2 U2 R U2 R' U L' R U R' U' R2 L",
				"F U R' D' r U2 r' D R2 U' R' U F'",
				"y R' U2 L R U' R' U L' U R U' R' U2 R",
				"R2 U' R2 U' R' D R' U R D' R' U R2",
				"y' L' U' L U L' U' L2 D L' U L D' L' U2 L' U L",
				"R' U' R2 U2 L' U R2 U' L U' R2 U' R'",
				"y' R U R' L' U2 R U R' U L U' L' U2 L"
            ],
            "AsA": [
				"y R' D' R U' R' D R U' R U' R' U R U' R' U' R U R'",
				"y2 R' U R U' R' U' R U R' U' R U' R D R' U' R D' R'",
				"y' R' U' R U' R' U2 R2 U R' U L' U R U' L U2 R'",
				"y2 R U' D R' U2 R D' R U R' U2 R U R2",
				"y R2 F R U R U' R' F R U2 R' U2 R' F2 R2",
				"F R U2 R' U R2 U2 R' U' R U' R2 U F'",
				"y' R2 U R U2 R' U R D' R U2 R' D U' R",
				"L U' D L' U2 L D' L U L' U2 L U L2",
				"y2 R U' R' U2 R D' R U R' U2 R U R' D R'",
				"y' S R U' R' U' F' U2 F r' F R F' M' S'"  
            ],
            "OxO": [
                "y2 R U R' U2 R' D' R U R' D R2 U' R' U R U' R'",
				"R2 U R' D' R U R' D R' U' R2 U' R2",
				"y2 R U2 R' U2 R2 D R' U2 R D' R2 U R U' R'",
				"y2 R' U F' R' U2 R U2 F U' R' U R2",
				"f R2 D R' U R D' R U' R' f' R' U R",
				"y' R U2 R' U' R U L' U L U2 R' L' U L",
				"y F R U R' U' F' U' r' U2 R U R' U' R U R' U r"
            ],
            "OsA": [
                "y R U' R2 D' r U2 r' D R2 U' R' U' R U' R'",
				"y R2 U' R U R2 x' U2 r U' r' U2 x D' R D",
				"y2 R U2 R' U2 R U R2 D' R U' R' D R U2 R U' R'",
				"y2 F R U R' U' R' F' R U R' F' R U R U' R' F R U' R'",
				"y2 L' U' L F L' U' L U L F' L' U L F' L' U' L' U L F",
				"R U R' U' R' U R D R' U' R2 D' R D R2 D' R",
				"F' U2 S' U' F U R U2 R' f R' F' R",
				"y R' U' R U' R' U' R2 D r' U2 r D' R2 U' R",
				"y' R' U' R U2 R D R' U' R D' R2 U R U2 R' U2 R",
				"R U R' U R U' R U R' U' R' F R2 U' R' U' R U R' F' U' R'",
				"D R D' F2 L' U' L F2 R2 U R U' R2"
            ],
            "CsO": [
				"y2 R U' R2 D' r U2 r' D R2 U R'",
				"L U' L2 D' l U2 l' D L2 U L'",
				"R U R' U R U' R' L' U2 R U R' U2 L",
				"y R U R' U' R2 D R' U2 R D' R2 U R U' R'",
				"L' U2 R U' R' U2 L R U R' U' R U' R'",
				"y R U R' U R U' R' U2 R' D' R U R' D R2 U' R' U R U' R'",
				"y2 R U' R2 D' L F2 L' D R2 U R'",
				"U2 R U' R2 D' L F2 L' D R2 U R'"
            ],
            "CxO": [
                "y2 R2 D' R U' R' D R U R U R' U2 R' D' R U2 R' D R2",
				"y2 F U R' D' R U R' D R U' R' D' R U' R' D R F'",
				"y2 R U2 R2 F R F' R U2 B2 r' U' r B' R'",
				"y2 F R' D' R U R' D R U R' D' R U' R' D R U' F'",
				"M' U R U' r' U' R U R' r' D' r U r' D r",
				"y2 r2 U R' U' r' F R F' U R' U' r' F R F'",
				"y R U R D R' U R D' R' U L' U R' U' L",
				"r' F R F' r U' R D R' U' R D' R' U' R'",
				"U2 z D' R2 D R' U' R D' R' U2 R' D R U' z'",
				"y' S R' F' R f' U' F U2 f R' F R f'",
				"y S R B' R' U' R D' R' F' R' F U D F z'",
				"y' f R' F' R f' U2 f r' U' R U r S'",
				"y2 r U2 R2 F R F' R U2 B2 r' U' L U' L'",
				"y' r' F R F' r U M' U R U' r' F R' F'",
				"y R' U L U' R2 U' L' U R' U' L U2 L'",
				"y2 F R' F' r U R U' F R' F' r U R U' r2",
				"R U2 R' U L U' R U L2 U R' U' L",
				"y R U' R2 F' L' F R2 U R' U' F' L F",
				"y2 S U R U' R' S' U' F' U2 F R' F R F'",
				"y' R U' R' S' U' F' U2 F R' F R F' U' S",
				"y R' F' r U R U' r' U2 R' D R U' R' D' R U' F",
				"L' U R U' L U' R D R' U' R D' R' U' R'",
				"y R U R' U R U' R' F' R U R' U' R' F R U' R' F R U R U' R' F'"
            ],
            "CsC": [
                "y2 R U R' F' R U R' U' R' F R U' R' F R U R U' R' F'",
				"y R U R' U R U R2 D' r U2 r' D R2 U R'",
				"y2 D' R' D x' U2 r U r' U2 x R2 U' R' U R2",
				"y' L' U L2 D l' U2 l D' L2 U L U L' U L",
				"R' F R f' R U2 R' U' F' U' F U2 S",
				"y2 f R2 S' R B' R' D' R2 D F' R B R'",
				"y' R U R' U2 R' D' R U R' D R2 U' R' U2 R U2 R'",
				"R' U2 R U2 R' U' R2 D R' U R D' R' U2 R' U R",
				"R' F R f' R U2 R' U' F' U S U2 F",
				"y R' U R2 D r' U2 r D' R2 U R U R' U R",
				"y' R U R U R' U' R' F R2 U' R' U' R U R' F' U R' U' R U' R'"
            ],
            "OsC": [
                "R' U R2 D r' U2 r D' R2 U' R",
				"L' U' L U' L' U L R U2 L' U' L U2 R'",
				"y2 R' U' R U' R' U R U R' F' R U R' U' R' F R2",
				"y R' U' R U R2 D' R U2 R' D R2 U' R' U R",
				"y2 L U2 R' U R U2 L' R' U' R U R' U R",
				"R2 F' R U R U' R' F R U' R' U' R U R' U R",
				"y2 R' U' R U' R' U R L U2 R' U' R U2 L'"
            ],
            "AsC": [
				"R' U' R U2 R D R' U' R D' R2 U R U' R' U R",
				"y2 R2 U' R D R' U' R D' R U R2 U R2",
				"R' U2 R U2 R2 D' R U2 R' D R2 U' R' U R",
				"y F U' R U R2 D' r U2 r' D R U' F'",
				"y L' U2 L U L' U' R U' R' U2 L R U' R'",
				"y' R' U2 R U R' U' L U' L' U2 R L U' L'",
				"y2 R2 D' R U' R' D R U' R U R2 D' R U R' D R2"
            ],
            "OxC": [
                "y2 R2 F R U R' U' R' F' R' U' R2 U2 R U2 R",
				"R' F' R U R' U2 R' D R U2 R' D' R U' R' F R U R",
				"y' R' U2 R' D' R2 U' r' F R' F' r U' R' D R2",
				"y r U r' R U R' U' R U R' U' r U' r' F R U R' U' F'",
				"f' U' F R' D' R U2 R' D R U' f R' F' R",
				"y R' U R U' R' U R U R' U2 R U' R' U' R' D' R U' R' D R2",
				"R U R' U2 R U' R' U' R U R' U' R U' R2 D' R U R' D R",
				"R U R' U R U' R' U R L' U L U2 R' U' L' U2 L",
				"y2 R' F R f' U R' D' R U2 R' D R F' U f",
				"y r' U2 L2 F' R' F R L2 U2 M' U' R U' R' U2 R",
				"y' R' U2 R' D' R U' f R' F' R f' U' F R' D R2",
				"y2 R' U' R' D' R U R' D R2 x L U' L D2 L' U L D2 L2 x'",
				"y' r U R' U' r' F R F' l R D2 R' U' R D2 R' U l'",
				"y' r U R' U' r' F R F' x' R2 D2 R' U' R D2 R' U R' x",
				"y' R' U2 R' U2 R2 U R F R U R U' R' F' R2",
				"R2 B' R' U' R U R B R U R2 U2 R' U2 R'",
				"R U R' U R U' R' U M F r U2 R' U' r' F2 r",
				"y' r U R' D' R' D R U2 R' D' R D U r' F R F'",
				"y' F' U' R' F R S' R U' B R' F' R B' U R' f",
				"y2 R' U' R' D' R U R' D R2 r U' L D2 L' U L D2 L' r'",
				"F R U R' U2 R U' R' U S r' F R F' M' f'",
				"y' R U2 R U2 R2 U' R' B' R' U' R' U R B R2"
            ],
            "CsA": [
				"y R U R' U' R U R2 D' R U' R' D R U2 R U' R'",
				"y2 R2 U R2 U R D' R U' R' D R U' R2",
				"y2 R U R' U' R2 D R' U2 R D' R2 U2 R U2 R'",
				"y' R2 U' R U F' U2 R' U2 R F U' R",
				"y L' U' L R U2 L' U' L U' R' U R U2 R'",
				"y' R' U' R f R U R' D R' U' R D' R2 f'"
            ],
        },

		// RLFF
        "3": {
            "AsA": [
                "y' R' U' R' D' R U R' D R U2 R U R' U R",
      "y' L' U' L2 F' L' F L' U L F U' F'",
      "y2 R U R' F' U' F U F2 r U r' F",
      "y R' F R' F' R2 U' R' U R f R' f'",
      "y2 R U R' U' l' U2 R U2 B r' U L",
      "y f R f' R' U' R U R2 F R F' R",
      "y2 R' U' R U' R' U2 R' D' R U' R' D R U R",
      "R U2 R' U' R' F R2 U' R' U' R U R' F' R U' R'",
      "y R' F R' F' R2 U' R' U' F' U' F R",
      "R U2 R' U' R U' R' U R U' L' U R' U' L",
      "R U2 R' U' R U' R' U R U' L' U R' U' L U2",
      "y' R' U2 R U R2 U L U' R U R L'"
            ],
            "AsC": [
                 "y R U R2 F R F' R U' R' F' U F",
      "y' R U R D R' U' R D' R' U2 R' U' R U' R'",
      "y x' R U' R U R2 F R F' R' u' R u x",
      "y F' U' F R U R' U' R l U' R' U l'",
      "R U R' U R U2 R D R' U R D' R' U' R'",
      "L' U2 L U L' U L U' L' U R U' L U R'",
      "L' U2 L U L F' L2 U L U L' U' L F L' U L",
      "y2 R' U' R2 U R' U' R' F R2 U' R' U' R U R' F' R' U R",
      "R U R' U R U' R2 D' R U R' D R U' R U' R'",
      "y' R U R' U R' D' R U' R' D R2 U R' U' R U' R'",
      "y F' U' F R U R' F R' F' R2 U' R'",
      "L' R U R U' L U R2 U R U2 R'",
      "y F' U' F R U R' U' x' R2 U' R' U l'"
            ],
            "AsO": [
                "R U' R' U R U R' U' R U R' U' R' D' R U' R' D R",
      "y2 R' U' R U' R' U R F U' R' U2 R U F'",
      "y2 R' U' R U' R' U R U L U2 R' U2 R U2 L'",
      "R U R' D R2 U' R2 U' R2 U2 R2 U' D' R U' R'",
      "L' U' L U' L' U L F U R U2 R' U' F'",
      "L' U' L U' L' U L U R U2 L' U2 L U2 R'",
      "y2 R' U' R U' R' U R f R U R2 U' R' f'"
            ],
            "CsA": [
      "y2 R U' R' U2 L R U' R' U L'",
      "y2 R' F R U R' U' R' F' R2 U' R' U2 R",
      "R' U2 R U R2 F R U R U' R' F' R",
      "r U R2 F R F' R U2 r' U r U r'",
      "L U' R U L' R' U2 R U R'",
      "y2 R U' L U L' R' U2 L U L'",
      "y' F' D R U' R' U' R U R' F' R U R' U' R' F R D' F U2",
      "L U' L' U2 R L U' L' U R'",
      "L U' L' U2 L R U' L' U R'",
      "R' U2 R U R' U R l' U' L U l F' L' F U'",
      "y2 R U' R' U' f R' F' R2 U' R' U S'"
            ],
            "CsC": [
                "R' U R U2 L' R' U R U' L",
      "R' U R U2 r' R' F R F' r",
      "R' U' R' U' R U R' F' R U R' U' R' F R'",
      "y2 L' U R' U' L R U2 R' U' R",
      "R' U L' U' L R U2 L' U' L",
      "y F' U2 R' U' R U' F U' R' U' R",
      "y2 L' U L U2 R' L' U L U' R",
      "y2 r' F R' F' r R U2 R' U' R",
      "R' U L' U' R L U2 L' U' L",
      "R' U r U2 R2 F R F' R U2 M"
            ],
            "CsO": [
				"y2 R' U' R2 U R' F' R U R' U' R' F R2 U' R' U' R' U R",
      "y2 F R U' R' S U' R U f' U R2 F R F' R",
      "R U2 R' U R2 D' R U' R' D U2 R U R U2 R' U' R2",
      "R' U2 R U f R' F' R' U' R U S' R' U R",
      "R' U2 R U f R' F' R' U' R U S' R' U R y2",
      "y2 R' U' R S U' R' U R F R f' U' R' U2 R",
      "R U R D R' U' R D' R' U R' U' R' F R2 U' R' U' R U R' F'",
      "y2 R' F R' F' R2 U' f U' R' U S' R U R' F'",
      "R U R' U' R' U L' U2 R U' R' U2 L R2 U' R'",
      "y' F R' F' U' F U R U' R F' U f R' S' R' F'",
      "y2 R' U2 R' D' R2 U R' U R2 U2 R2 D R U' R U' R'"
            ],
            "CxO": [
                      "R' U2 R U R' U R F U R U2 R' U R U R' F'",
      "r' U2 R U R2 F2 R F R' F2 R U r",
      "R' F' R U' R' D R U2 R' U' D' R' F R U R",
      "y2 F R U R' U' R' F' R U' R' D' R U' R' D R U' R U' R'",
      "y2 L F R U2 R' U R U2 R2 F R F2 L'",
      "y2 r U R B2 R' B R B2 R2 U R U2 r'",
      "R2 U S R S' U' R2 D R' S' U S R D'",
      "R2 U R U' R2 U R U2 L' R U R U' R2 r x'",
      "r' U2 R U R' l' U2 R U R' U2 l U r",
      "y' f R f' U F R2 B' U' R2 U R2 f R F' z'",
      "y2 R' f' U f U2 R U S R2 U' R U R2 S'",
      "y' f U2 R' D' R U' R' D R F U' f' L F' L'",
      "y2 r U l U2 R' U R U2 l' R' U R U2 r'"
            ],
            "OsA": [
                 "F U' R' U2 R U F' R' U' R U R' U R",
      "y2 R' D' R U R' D R U R U' R' U R U' R' U' R U R'",
      "y L U2 R' U2 R U2 L' U' R' U' R U R' U R",
      "y2 r' F' r U r' F r2 U2 r' U F2 U' r U2 r'"
            ],
            "OsC": [
                "y2 r U' r U2 R' F R U2 r2 F",
      "y2 F' r2 U2 R' F' R U2 r' U r'",
      "y2 R' F R' D2 r D' r' D2 R2 F'",
      "r' U r' U2 l U' R' F2 r2 U' x",
      "R f' U R2 D' F D R2 U2 B",
      "y' z S' R U R' U' R' F R2 U' R' U' R U R' F' S",
      "R' U' F R U R' U' R' F R2 U' R' U' R U R' F2 U R",
      "R' U R U2 R' U' F' R U R' U R U2 R' F R",
      "y' R U2 R U2 F2 R F2 L' U2 L U2 R2",
      "y' z R U R' U' R' F R2 U' R' U' R U R' F' S R2 S' z'",
      "y' z S' R U R' U' R' F R2 U' R' U' R U R' F' S z'",
      "y' F B' R U R' U' R' F R2 U' R' U' R U R' F2 B"
            ],
            "OsO": [
                "y L' U2 R U2 R' U2 L U R U R' U' R U' R'",
      "F' U L U2 L' U' F L U L' U' L U' L'",
      "y2 r D r' U2 r D' r' d' R U R' U' R U' R'",
      "y2 F' U' L' U2 L U F R U R' U' R U' R'",
      "R D R' U' R D' R' U' R' U R U' R' U R U R' U' R",
      "y2 L D L' U' L D' L' U' L' U L U' L' U L U L' U' L",
      "y2 F' U' R' U' R' F R F' U R F U' R U' R'",
      "y2 B' U R U2 R' U' B R U R' U' R U' R'",
      "y2 R' U' R' D' R U R' D R' U R' U' D R2 U' R U' R' U R' U R2 D'"
            ],
            "OxC": [
                "F R U' R' U' R U2 R' U' F' R' U' R U' R' U2 R",
      "y' R U R' U R' D' R U R' D R U R' F R U R U' R' F'",
      "r' U' l' U2 R U' R' U2 l R U' R' U2 r",
      "y2 r U2 R' U' l R U2 R' U' R U2 l' U' r'",
      "r' U' R' F2 R F' R' F2 R2 U' R' U2 r",
      "y2 R' U' R' F' R D U R U2 R' D' R U R' F R",
      "L F L' U L D' L' U2 L U D L F' L' U' L'",
      "y2 R' B' U' R2 U R2 f D' R U r' D2 r U' z'",
      "y F' U R' D R U R' E F U' f R F' R D z'",
      "y F' U R' D R U R' D' U L U' R U L' U F",
      "y2 r U2 R' U' l R U2 R' U' R U2 R' F' L'"
            ],
            "OxO": [
                "R U R' U R U' R' F' U' L' U2 L U F",
      "R U R' U R U' R' U' L' U2 R U2 R' U2 L",
      "y2 R' U R U' R' U' R U R' U' R U R D R' U R D' R'",
      "R' F R U2 M' U r' F' R U' F U' F'",
      "R U R' U R U' R' U' R' F2 R F2 L' U2 L",
      "R' F R U2 M' U L' U' l U' F U' F'",
      "L' U L U' L' U' L U L' U' L U L D L' U L D' L'",
      "y2 L U L' U L U' L' F' U L U2 L' U' F",
      "R U R D R' U' R D' R' U R' U' D R2 U' R U' R' U R' U R2 D'",
      "R' F R U2 M' U L' U' l y' U' R U' R'",
      "R U R' U R U' R' U' z U' R2 D R2 D' R2 U z",
      "R U R' U R U' R' U' z U' R2 D R2 D' R2 U z'",
      "R U R' U R U' R' d r D r' U2 r D' r'",
      "R U R' U R U' R' B' U R U2 R' U' B"
            ]
        },

		// FFLR
        "4": {
            "AsA": [
                "y' R U R' U2 R U' R' U2 R U' R2 F' R U R U' R' F",
      "r U2 R2 F R F' U2 r' F R U R U' R' F'",
      "F' U' F U R' F R2 U R' U' R' F' R2 U R'",
      "y R U R' U2 R D' R U' R' U' R U2 R' U D R'",
      "y R' U' R U2 R' D R' U R U R' U2 R D' U' R",
      "y R U E R' U2 R E' F' R' U' R F U2 R'",
      "f U' R' U R2 S' R' U2 R U' F' R' U2 R",
      "y2 R U2 R2 U' R2 U' R' U2 R' U R L' U R' U' R L",
      "y' R' f' R U' F U R U R' S U' f' R' f R",
      "R' U' R' F R f' U S U R F' R' U' R F",
      "y' R U2 x U R' U R2 U' R' U R' U2 x' U2 R'"
            ],
            "AsC": [
                "r U R' U' r' F R F' R' U2 R U R' U R",
      "R' U R2 D R' U R D' R' U R' U' R U' R' U' R",
      "M' f' U' f r' U' R U' R U R' U R",
      "y2 r' F2 r U r' F r2 U R' U' r' F R F'",
      "y2 L' U2 L U L' U L U' r' U' L D' L' U L D x",
      "y2 R U2 R' U2 R U R2 D' R U2 R' D R U' R U' R'",
      "f' U' f U2 R U R' U r' U' R U r",
      "y2 f R2 F' R F R2 F' r' U' R U r S'",
      "y f R' F' R U2 R' F R F' R U2 R' S'",
      "z U' R' U z' U' R U2 R' U' R U2 r' F r R'",
      "R' U2 R U R' U R U' R U R D R' U' R D' R2",
      "L' U' L U' R U2 R' U' R U2 L' U M' x'",
      "R' L U' R' U L' U' R U' R U R' U R",
      "y2 f' R' U2 R f E R' U R D L U2 L'",
      "y' R' D' F2 D R D' U L' U L D R U2 R'"
            ],
            "AsO": [
                "y R' U' R U' F U' R' U R U F' R' U R",
      "y2 R D R' U' R D' R2 U' R U2 R' U R U R' U R",
      "y R' U' R U2 R2 F' R U R U' R' F R U2 R' U R",
      "y R' U' R L U2 R' U R U2 L' U' R' U R",
      "y' L' U' L R U2 L' U L U2 R' U' L' U L",
      "y R' U' R U2 R' U R U R' U' R' D' R U' R' D R U' R",
      "y R D' R2 U' R U2 R' U R U R' U R U' R D R'",
      "y R' U' R U' F U' R' U R U x' D' R' F R x",
      "y' R U2 R' L' U R U L U2 R' U' L' U L"
            ],
            "CsA": [
                 "R' U2 R' D' R U2 R' D R' U R' U R U2 R'",
      "y' R2 F' R U S' R U' R' f R f R f'",
      "y' R U R2 D' R U2 R' D R U2 R U R' U' R U' R'",
      "R' U2 R' D' R U2 R' D R3 U R' U R U2 R'",
      "y' R B2 R' U R2 B2 R2 U R U2 R B2 R2",
      "F' L' U' L U F L' U' L U' L' U L U L F' L' F",
      "y2 R U2 R D R' U2 R D' R2 U R U2 R' U' R U' R'",
      "y' F R2 F' R U S' R U' R' f R S R f'",
      "y' R U2 R' U' R U' R' U R U2 R D R' U2 R D' R2",
      "y2 R U' R U D' R U' R' D U2 R2 U' R2 U' R'"
            ],
            "CsC": [
                "y' l' U2 R' D2 R U2 R' D2 R2 x'",
      "y R' D' R' D R U2 R' D' R U2 D R",
      "y' l' U2 R' D2 R U2 R' D2 l2",
      "y2 R U2 R' U R U R' y' R' U' R U2 R' U' R",
      "y' x R' U2 R' D2 R U2 R' D2 R2 x'",
      "y2 F R U R2 U' R' F' R U R2 U' R'",
      "y R U2 R' F2 R U2 R' U2 R' F2 R",
      "y L2 F2 L' U2 L' U2 L F2 L' U2 L U2 L'",
      "y2 F U' R' U2 R U F' U' R' U2 R",
      "y2 F' U' R' D R U2 R' D' R U' F",
      "y R' D U' R D R' U2 R D' R' D' U' R",
      "F U R U' R' F' R' F R U R' U' F' U R",
      "y2 R U2 R' U2 R' F' R U2 R U2 R' F"
            ],
            "CsO": [
                "y R U R' U R' D' R U' R' D R U R U2 R'",
      "y2 R F R' U R U2 R' U R U F' R'",
      "y R U R D R' U' R D' R' U R' U R U2 R'",
      "R' D' R U R' D R U2 R U2 R' U R U R'",
      "y' R U R' F' R U R2 F' R U R U' R' F R U' R' F R U' R'",
      "r D r' U r B2 r' U r B D' r'"
            ],
            "CxO": [
                "R' D' R U R' D R2 U R' U2 R U' R' U' R U' R'",
      "y R U R' L' U2 R U' R' U2 L U R U' R'",
      "y R U R' U B' U R U' R' U' B R U' R'",
      "U R U R' U f' L U L' U' L' f R U' R'",
      "y2 F U S R F' R' U2 R F R' U2 S' U' F'",
      "R' U2 R2 U' f' U' F R U2 R2 U R S",
      "y2 F U F' U2 R F R' U' R F' R' U' F U' F'",
      "y' S U' F U R F' R' U2 R F R' U F' U S'",
      "y S' U' f U' R' F R2 F' R U R2 f' U S",
      "y R' F' U' F U R2 F R2 F' R U S R2 S' U' R2",
      "y R' U2 R' U2 R2 D' R U R' U' R U2 R' D R'",
      "y R F' U R' U' R U2 R' U F U2 F' R U' F R'",
      "y F' R' D U' R U' R' D' U' F U' F' U' R F",
      "y R D' R2 U2 R' U2 R' U R' U' R U2 R' D R'",
      "y S2 R U R' S' U R' U' F R' f' R2 U R",
      "y R U R' r' F2 R F' R' F2 r U R U' R'",
      "y' L U L' U F' U L U' L' U' F L U' L'"
            ],
            "OsA": [
                "y R' U' R' D' R U R' D R U' R U' R' U2 R",
      "y2 r' D' r U' r' F2 r U' r' F' D r",
      "y2 F U' R' U2 R' U2 R U' R' U' R U R U F'",
      "y' L' U' L U' L D L' U L D' L' U' L' U2 L",
      "y' r' F' r U' r F r' U r F' r' U' r' F2 r",
      "y R' U' R U' R D R' U R D' R' U' R' U2 R",
      "y2 z U' F' U R' U' R2 U R' U' R' F U z'",
      "y2 R D R' U' R D' R' U2 R' U2 R U' R' U' R",
      "U' R' L' U2 R U' L U R' U2 R U' L' U L",
      "y R' U' y' R' U l U l' U L y' R U R' U' S z'"
            ],
            "OsC": [
                "y' R' F2 R U' R2 F2 R2 U' R' U2 R' F2 R2",
      "y2 R U2 R D R' U2 R D' R U' R U' R' U2 R",
      "R' U2 R' D' R U2 R' D R2 U' R' U2 R U R' U R",
      "F R U R' U' F' R U R' U R U' R' U' R' F R F'",
      "y L2 F L' U' S L' U L f' L' B' U' B",
      "y' R' U2 R U R' U R U' R' U2 R' D' R U2 R' D R2",
      "y2 F U' R' U2 R D R' U' R U D' F' R' U2 R",
      "y' R' U' R2 D R' U2 R D' R' U2 R' U' R U R' U R",
      "y2 R D R' U' R D' R2 F2 U' L' U L F2 R",
      "R' U R' U' D R' U R D' U2 R2 U R2 U R"
            ],
            "OsO": [
                "y' l U2 R D2 R' U2 R D2 R2 x",
      "R' U2 R U' R' F R U R' U' R' F' R U' R",
      "R' U D R2 U' R' D' R U R' D R' D' U' R",
      "R' U2 R U' R' U' R y R U R' U2 R U R'",
      "y' x' R U2 R D2 R' U2 R D2 R2 x",
      "y r U2 L D2 L' U2 L D2 L2",
      "y' l U2 R D2 R' U2 R D2 l2",
      "y' R2 F2 R U2 R U2 R' F2 R U2 R' U2 R",
      "y' L' U2 R U2 R' U2 L U2 R U2 R'",
      "y2 f R' D' R U2 R' D R U2 f'",
      "y2 F R' D' R U2 R' D R U2 F'",
      "y R D' U R' D' R U2 R' D R D U R'",
      "y' R' F R F' R' F R F' R' F R F' R U R' U' R U R' U' R U R'",
      "y R' U2 R B2 R' U2 R U2 R B2 R'"
            ],
            "OxC": [
                "y2 R U2 R' U' R U' R2 F' r U R U' r' F",
      "y2 R U' R2 D' R U' R' D R U' R U R' U R U R'",
      "y2 M F R F' r U R' U R' U' R U' R'",
      "y2 F R U R' U' R' F' R U F' R U R' U' R' F R2 U' R'",
      "L U2 L' U' L U' L' U L' U' L' D' L U L' D L2",
      "y2 R U2 R' U' R U' R' U R' U' R' D' R U R' D R2",
      "y2 R U2 R' U' R U' R2 U' R' F R U R U' R' F' R",
      "R U R' U L' U2 L U L' U2 R U' M' x'",
      "y2 F R F' U2 R' U' R U' L F R' F' L'",
      "R U R' f U' R2 D R D' R2 U R' f'",
      "y2 F R U R' U' S' R U' R' S U' R U R' F'",
      "L U' R U' L' U R2 U2 L U' L' U2 R"
            ],
            "OxO": [
                "y2 F R U R' U' R U' R' U' R U R' F'",
      "f U R U' R' U R' U' R f' R' U R",
      "y R' F' U' F U R F R' F' R U R U' R'"
            ]
        },

		// FLFR
        "5": {
            "AsA": [
                "y2 F R U R' U' R' F' U2 R U R U' R2 U2 R",
      "M U' r U R' U' R' F R F' M U M'",
      "y' F U2 F' U F U' R U' R' U' R U2 R' U2 F'",
      "L2 U2 L U' L' U L' U2 L' U' R U' L' U R'",
      "R U R' U R U' R' U R U2 R D R' U2 R D' R' U2 R'",
      "y' r U R' U' r' F R F' R U' R U R U R U' R' U' R2",
      "y2 R2 U2 R U' R' U R' U2 R' U' L U' R' U L'"
            ],
            "AsC": [
                "y' R' D' R U R' D R2 U' R' U R U R' U' R U R'",
      "R' D R2 U' R' U R U R' U' R U R2 D' R",
      "y2 R' U' R U R U f' U' F R U' R' S",
      "y R2 U' R2 U' R2 U R' D' R U R' D R'",
      "R D' R' U R2 U' R2 U' R2 U2 R' D R'",
      "R U' R' U R U R' U' R U R2 D' R U2 R' D R",
      "R U R D R' U' R D' R' U R' U R' U' R2 U' R' U R' U R",
      "R U R D R' U' R D' U' R' U' R U R U R U' R",
      "R U R' U R' D' R U' R' D R U R' U' R2 U' R' U R' U R",
      "y' R F U R2 U' R2 F' U R U R2 U' R2",
      "y R' L' U2 R U R' U' R U' L U2 R' U R"
            ],
            "AsO": [
                "y' R U2 R' U2 R' F R U R U' R' F'",
      "y R' U' R U2 R' U' R y R U R' U2 R U R'",
      "y R' U' R U2 R' F R U R' U' R' F' R U' R"
            ],
            "CsA": [
                "y R U R' U R U R' U2 L R U' R' U L'",
      "y' L U L' U L U L' U2 L R U' L' U R'",
      "S R' U R2 U' F U R2 U' F' R S'",
      "y2 R' U' R U f R U R2 U' R' f' R' U2 R",
      "y' R U2 R U D' R U R' D R' U' R' U' R2",
      "y2 R' U' R U F U' R' U2 R U F' R' U2 R U2",
      "y' R2 U f R2 f' R2 U2 f' U2 f R2 U R2 U'",
      "y R U R' U R U L U R' L' U2 L U L'",
      "y R U R' U R U2 R2 F R U R' U' R' F' R2 U' R' U2 R",
      "y' L U L' U L U R U L' R' U2 R U R'"
            ],
            "CsC": [
                "y2 R' U' R U D' R U' R U R U' R2 D",
      "R U R D R' U M U2 r D' R2",
      "R U R D R' U R r' U2 r D' R2",
      "y2 R' D R2 U2 R' U2 R U R' U' R U R2 D' R",
      "L2 F2 L' U2 L' U2 L F2 L' U L U' L'",
      "y2 R' U' R U R U' R2 F' R' U R U' F R2",
      "y2 R2 B2 R' U2 R' U2 R B2 R' U R U' R'",
      "F U R2 D R' U' R D' R' U' R' U R U R' F'",
      "y' R' F' R U R' U' R' F R2 U' R2 D' R U2 R' D R2",
      "y L R U' R' U L' R U R' U R U R' U' R U' R'",
      "y2 F R2 S R f' U' r U R2 U' r'",
      "y f' U2 S U' R U S' R U' R' f R'"
            ],
            "CsO": [
				"y' R U R' U' R U' R' L U' R U R' L'",
      "y' R U S' R' U' R S R2 F R F'",
      "y R U R' F' U2 F U R' U' R U' R' U2 F R F'",
      "y' R F U R' U' R U' R' U' R U F' R'",
      "y' R U R' U' R U2 F U R' U' R F' U R'",
      "L' U' L U L' U L U F' L' U' L U L F L'",
      "y' R U R' U' R U' M' x' U' R U R' L'",
      "F U R' F2 R U' F' U' R U2 R' r U r' U2",
      "U2 R' U' R2 f D R2 D' R2 f' R U R2 U R'",
      "R' U2 R F R' f' U F' f U2 F R F'",
      "y2 x' D R U' R' U R' U' D R' U R D2 x"
            ],
            "CxO": [
                "R' U' R U' R2 F' R U R U' R' F U R U' R' U2 R",
      "y' R F R' U R U' R' U R U' F' R2 F' R U R U' R' F",
      "y' F' L' U' L U L' U' L U F L' U' L U L F' L' F",
      "y' R' U2 R U2 R' U R U' L U' R' U L' U R",
      "y L' U2 L U2 L' U L U' R U' L' U R' U L",
      "R U R D R' U' R D' r2 U' M2 U2 M2 U' M2",
      "R2 D' R U2 R' D R U R U' R' U R U' R' U R U' R' U2 R",
      "R U' F U2 F' R' U2 R' U' F U F' R2 U2 R'",
      "y R' U' F R' F' R F R' F' R F U R U' R' F' R",
      "y' r U R' U' r' F R F' M2 U M2 U2 M2 U M2",
      "R2 D' R U2 R' D R2 U R' U' R U R' U' R U R' U R",
      "R' U' R' D' R U' R' U2 R U R' D U R U2 R U2 R' U' R",
      "y' R2 U S2 R2 U S' U2 R' F R2 F' R' S'"
            ],
            "OsA": [
                "F U' B' R2 U' R2 U R2 F' B",
      "y2 f R' F' U2 R' U2 R U2 S'",
      "y' R U' R' U' R U R D R' U2 R D' R' U' R'",
      "y' R U' r' U2 F' U2 F U2 M'",
      "y L U' R' y' R2 U' R2 U R2 S z'"
            ],
            "OsC": [
                "y2 R U R D R' U2 R D' R' U' R' U R U' R' U' R U' R'",
      "y R2 U R' U' R' U R' U2 D R' U2 R D'",
      "L U2 L' F' U L U' L' U' F L U' L'",
      "y F' U R U R' U' R' U' F R U R U' R' U' R' U R",
      "L U2 r' D' F r U' r' F' D r U' L'",
      "y2 R U2 R' f' L U L' U' L' f R U' R'",
      "y' R U2 R2 D R' U' R D' U R U' R2 U' R'",
      "U F' U R U R' U' R' U' F R U R U' R' U' R' U R",
      "y2 R U2 R' B' U R U' R' U' B R U' R'",
      "y2 R' U2 D R' U R' U' R' U R2 U D' R"
            ],
            "OsO": [
                "y2 R L' U R' U' L U R U R' U' R U' R'",
      "y R' U' R U R' U' R2 D R' U2 R D' R' U R' U R",
      "U F' U' L U L' F L U L' U' L U' L'",
      "y2 L' R U R' U' L U R U R' U' R U' R'",
      "y' f' L' U L U' f R U R' U' R U' R'",
      "y2 r' R F R' F' r U R U R' U' R U' R'",
      "y2 M F R' F' r U R U R' U' R U' R'",
      "y2 r' F R F' r U' R' U' R U R' U' R U' R'",
      "R' U' y' R U l' D l U R' U' R U' R'"
            ],
            "OxC": [
                "y' r U R' U' r' F R F'",
      "R U R D R' U' R D' R2",
      "y2 x' L' U' L D' L' U L D",
      "x R' U' R D' R' U R D x'",
      "x' R' D' R U' R' D R U x",
      "y2 x' D R U' R' D' R U R' x",
      "y2 R' U2 R' D' R U R' D R U R",
      "y' R U R' U' L' U R U' R' L",
      "R' F' R U R' U' R' F R U R"
            ],
            "OxO": [
                "y' F' U' r' F2 r U F R U' R'",
      "y2 R' U' R U' R' U R' F' R U R U' R' F R",
      "y' F' U' L' U2 L U' L' U' L F",
      "y2 L' U2 R U2 R' U2 L U R U' R'",
      "y' F' U' L' U2 L U F R U' R'",
      "y B' U' R' U2 R U' R' U' R B",
      "y2 R' U' F' U2 F U R f R' f'",
      "x' R' F2 r U2 L' U2 R U L U' L'"
            ]
        },

		// RFLF
        "6": {
            "AsA": [
                "R' U2 R F U' R' U R U F' R' U R",
      "R' U' R' D' R U2 R' D R U R U' R' U R U R' U R",
      "R' U2 R U' R2 F' R U R U' R' F R U2 R' U R",
      "R U2 D' R U' R U R U' R2 D U' R'",
      "y R2 U' R U R U' R U2 D' R U2 R' D",
      "L R' U' R U L' R U R' U' R' U R U R U' R'",
      "y' L U' R U R' U z U' R U R2 U' R z' R U' R'"
            ],
            "AsC": [
                "R2 F2 R U2 R U2 R' F2 R U' R' U R",
      "y2 R' U' R' D' R U' R' r U2 r' D R2",
      "R U R' U' D R' U R' U' R' U R2 D'",
      "y2 R' U' R' D' R U' M' U2 r' D R2",
      "D' R U R' U' D R' U R' U' R' U R2",
      "R U R' U' D R' U R' U' R' U R2 u'",
      "y2 R' U' R' u' f R' S' R2 F' u R2",
      "y R' L' U R U' L R' U' R U' R' U' R U R' U R",
      "R U R' U' R' U R' U' D R' U R D' R"
            ],
            "AsO": [
                "y R U R' U' R U R2 D' R U2 R' D R U' R U' R'",
      "y' F U R' U' R F' R' U' R U R' U R",
      "L U' R' U L' U R U R' U' R U R' U R",
      "L R' U' R U L' U' R' U' R U R' U R",
      "x' M' U' R U L' U' R' U' R U R' U R",
      "y2 M F' r U R' U' r' F' r U r' F r"
            ],
            "CsA": [
                "y F U R U2 R' U R U R' F'",
      "y F U R U2 R' U' F' L' U L",
      "y2 R U2 r' F2 r U2 R' U' L' U L",
      "L U2 R' U2 R U2 L' U' R' U R",
      "R U R' U R U' R B R' U' R' U R B' R'"
            ],
            "CsC": [
                "y2 R' U' R' D' R U R' D R2",
      "y R' F' r U R U' r' F",
      "y' F R F' r U R' U' r'",
      "y2 x' R U R' D R U' R' D' x",
      "y l' U' L U R U' r' F",
      "U2 F R' D' R U R' D R U' F'",
      "R U2 R D R' U' R D' R' U' R'",
      "y l' U' L U l F' L' F",
      "x D' R' U R D R' U' R",
      "y' R' U' R U L U' R' U R L'",
      "y R' F' r U R U' z U' R",
      "y' r' U' R U L U' R' U",
      "y2 x' R U R' D R U' R' u'",
      "y R' U' R' F R U R U' R' F' R",
      "x' U' R' D R U R' D' R x",
      "y2 l U R' D R U' R' D'"
            ],
            "CsO": [
               "y2 F R2 D R' U' R D' R2 U' R U2 R' U' F'",
      "y' R D R' U' R D' R2 U R U' R' U' R U R' U' R",
      "R U R' U' R' U' F R f' R' U R S",
      "y R2 U R2 U R2 U' R D R' U' R D' R",
      "y2 R D' R2 U R U' R' U' R U R' U' R2 D R'",
      "y R' F' U2 F U' S R' F R f' U2 R",
      "y R L U2 R' U' R U R' U L' U2 R U' R'",
      "y2 R' U' R' D' R U R' D U R U R' U' R' U' R' U R'",
      "y2 R' U R U' R' U' R U R' U' R2 D R' U2 R D' R'"
            ],
            "CxO": [
                "y' R' U R U R' U' R' D' R U2 R' D R U R",
      "F' U f U2 R U2 R' U2 S'",
      "y r' F R U2 y' R U2 R' U2 S'",
      "y' R' U r U2 B U2 B' U2 M",
      "y' R' U L y' R2 U R2 U' R2 B F'",
      "y r' F R U2 F U2 F' U2 M'",
      "y' R' U r U2 y R U2 R' U2 S'",
      "y' R' U L y' R2 U R2 U' R2 S z'"
            ],
            "OsA": [
                "y R' U2 R2 U R' U' R' U2 F' R U2 R U2 R' F",
      "R' U2 R U' R' D R' U R U R' U2 R U' D' R",
      "M U R' F' r U r U' r' F M U' M'",
      "y R' F R U2 S R' F' R S' F R U2 R' F'",
      "y2 R' U' R U' R' U R U' R' U2 R' D' R U2 R' D R U2 R",
      "R2 U2 R' U R U' R U2 R U L' U R U' L",
      "R' U2 D' R U' R' D R' U R U R' U2 R U' R",
      "L R' U' R U L' R U R' U' R' U' R U R U' R2 U2 R",
      "R U S' R' U2 R S r' U F' U' F M'",
      "y2 M U' M' F U F' M U' R' F' R U2 M'",
      "R2 U2 R' U R U' R U2 R U r' F R F' r",
      "y R' F' r U R U' r' F R2 U R U R' U' R' U' R' U R'",
      "R' U2 R' U' R' U' R3 F' R' U R U' F U2 R2",
      "R2 U' R' D' R U' R' D R U S R2 S' R2 U R2",
      "R2 U' S R2 S' R D' R U' R' D R U2 R2",
      "y' F U R' U' R F' U R U R' U' R' U' R U R U' R2 U2 R",
      "R' U2 R' U' R' U' R' F' R' U R U' F U2 R2",
      "y' F R U R' U' F' R' F R F' y' U' R' U' R U R' U R",
      "y2 F' L' U' L U L F U2 L' U' L' U L2 U2 L'"
            ],
            "OsC": [
                "y R U R' U' R' F' R U2 R U2 R' F",
      "y L' U2 L U2 L F' L' U' L' U L F",
      "y R U R' U2 R U R' y' R' U' R U2 R' U' R",
      "y r' F2 r U2 r U' r' U' r' F r F"
            ],
            "OsO": [
                 "y F R U R' U' R U R' U' F' R U R' U' R' F R F'",
      "y' R U2 R' U2 R U' R' U r' F R F' r U' R'",
      "y' R U2 R' U2 R U' R' U L' U R U' L U' R'",
      "y2 R' U' R U' F U' R' U R U F' R' U' R U R' U R",
      "y r' D' r U' r' F r U' r' F D r2 U r' U' r' F r F'",
      "y2 R' U' R' D' R U R' D r2 U' M2 U2 M2 U' M2",
      "y2 R2 D R' U2 R D' R2 U' R U R' U' R U R' U' R U' R'",
      "y' R2 U R U' R2 D U2 R2 U2 R U2 R U' R D'",
      "y2 F U' F' R2 F' R2 U R2 U' F2 U F' R2",
      "y' R2 U' S2 R2 U' S' U2 R B' R2 B R S'"
            ],
            "OxC": [
                "y R' U' R U' R' U' R U2 L' R' U R U' L",
      "y2 S R U' R2 U B' U' R2 U B R' S'",
      "y' R' U2 R' U' D R' U' R D' R U R U R2",
      "y R' U2 R2 U R2 U R F' R U2 R' U2 R' F R",
      "y' L' U' L U' L' U' L U2 R' L' U L U' R",
      "y R' U' R U' R' U' R U F' U R' U R U2 F",
      "y2 R' U' R' D' R U R' D R U R' U' R' U' R' U R U R2 U'",
      "y' L' U' L U' r' F' r U2 R' L' U L U' R",
      "R' U R D' R U' R' D U' R' U2 R' U' R2 U R2",
      "y R' U' R U' R' U' R U2 R' L' U R U' L",
      "y F R2 F' R2 U' f' R' U2 R S U F",
      "y R' U' R U' R' U' R U2 r' R' F R F' r",
      "y R' U' R U' R' U' L' U' L R U2 L' U' L",
      "y' z U' R' U R' U' R' U z' U2 R' z U' R U R' D",
      "y R' U' R U' R' U' r' F' r R U2 L' U' L",
      "y' L' U' L U' r' F' R' F' r R U2 R' U' R",
      "U R' U' R U' R' U R' U' R U R' F' R U R' U' R' F R'",
      "y' R2 U' F' D2 B U2 B' D2 F R2 U R2"
            ],
            "OxO": [
                "y' R' U' R U R' U R L' U R' U' R L",
      "R U R' U' R U' R' U' F R U R' U' R' F' R",
      "y' R' U' S' R U R' S R2 f' U' f",
      "y' R' U' R U R' U R r' F R' F' r R",
      "y r' D' F' r U r' F r U r' F' D r",
      "R U R U' R2 U' D R' U2 R U2 D' R",
      "y' R' U' R U R' U R U' F' U2 R' U' R U' F",
      "x D' R' U R U' R U D' R U' R' D2 x'",
      "y R' D' R U R' D R U2 R U R' U' R U' R' U' R U R'",
      "y' R' U' S' R U R' S U F R' F' R2",
      "R' F' U' F U R U R' U' F U R U' R' F' R",
      "y' R' B' U' R U R' U R U R' U' B R"
            ]
        },

        
    },

    // This is for the U ZBLL set
    "U": {
        // LRFF
        "2GLL": {
            "AsA": [
                "R' U' R U' R' U2 R2 U R' U R U2 R'",
      "y2 L' U' L U' L' U2 L2 U L' U L U2 L'"
            ],
            "AsC": [
                "y R' U2 R U R' U R U R' U' R U' R' U2 R",
      "y' L' U2 L U L' U L U' R' U' R U' R' U2 R",
      "y' L' U2 L U L' U L U L' U' L U' L' U2 L"
            ],
            "AsO": [
                "R' U' R U' R U2 R2 U' R2 U' R2 U R",
      "R' U' R U' R U R' U' R' U2 R U2 R U2 R'",
      "R' U' R U' R U R' U R U2 R' U2 R' U2 R",
      "R' U' R U' R U R2 U' R2 U R2 U R2 U' R'",
      "y2 L' U' L U R U R' U L' U2 L R U2 R'"
            ],
            "CsA": [
                "y' R U R' U' R U' R' U2 R U' R' U2 R U R'",
      "R' U' R U' R' U2 R U' R' U2 R U R' U R",
      "y2 L' U' L U' L' U2 L U' L' U2 L U L' U L"
            ],
            "CsC": [
                "y R U2 R' U' R U' R' U2 R' U2 R U R' U R",
      "y R' F' R U R' U' R' F D' R U R' D R2",
      "y R' D' R D R' D' R U R' D R D' R' D R",
      "y' r U R' U' R U R' U' r' F R F' R' F R F'",
      "y R U2 R' U' R U' R' L' U2 L U L' U L",
      "F R' F' r U R U' R' U R U' r' F R' F' R",
      "y R2 U' R' U R' U' R2 U R2 U R U' R U R2",
      "y D R D' R D R2 D' U' R' U R' U' R2",
      "R' U' R U R' U' L' U R U' R' U R U' L",
      "y' R U2 R U2 R' U' R U' R' U2 R' U2 R U R'",
      "y L R U2 R' U' R U' R' L' U2 L U L'",
      "y' R' L' U2 L U L' U L R U2 R' U' R",
      "y2 R U2 R U2 R' L' U' L U' R U' R' L' U2 L U' R'",
      "U' R U2 R U2 R' U' R U' R' U2 R' U2 R U R'",
      "y2 R' D R D' R' D R U' R' D' R D R' D' R",
      "y2 F R U R2 D' R U' R' D F' R U R U' R'",
      "y R' U2 R U' R U2 R' U2 R' U' R U R U' R'",
      "y' L' U2 L U L' U L R U2 R' U' R U' R'",
      "y' r' F2 r U r' F r R U2 R' U' R U' R'"
            ],
            "CsO": [
                "y' R' U' R U R' U R U2 R' U R U2 R' U' R",
      "y2 R U R' U R U2 R' U R U2 R' U' R U' R'",
      "L U L' U L U2 L' U L U2 L' U' L U' L'",
      "y L' U' L U L' U L U2 L' U L U2 L' U' L",
      "L U L' U L U2 L' U' R U2 R' U' R U' R'"
            ],
            "CxO": [
                "y R U2 R' U' R U' R' U' R U R' U R U2 R'"
            ],
            "OsA": [
                "y R' U2 R2 U R2 U R U' R U R' U' R U' R'",
      "U R' U2 R2 U R2 U R U' R U R' U' R U' R'",
      "y' r' F2 r2 U' r' F r' F U' F U r",
      "y2 R' U' R U R U' R' U' R U' R' U R' U R2 U R'",
      "R U R' F' R U R' F' R U R' U' R' F R U' R' F R2 U' R'",
      "R U R' U' R U R' U' R U R' U' R2 U R2 U R2 U2 R2",
      "U' r' F2 r2 U' r' F r' F U' F U r",
      "y R' U' F R' F' R2 U' R' U y' R' U R B",
      "y R' U' F R' F' R2 U' R' U F' U F R"
            ],
            "OsC": [
                "y R U2 R2 U' R2 U' R' U R' U' R U R' U R",
      "U' L U2 L2 U' L2 U' L' U L' U' L U L' U L",
      "y R U2 R2 F R F' R U' B U' B' R'",
      "R U R' U' R' U R U R' U R U' R U' R2 U' R"
            ],
            "OsO": [
                "R U R' U' R U' R U2 R2 U' R U R' U' R2 U' R2",
      "R U R' U' R' U R U R U' R' U R' U R U2 R' U' R",
      "R U2 R' U' R U' R' U2 R' U2 R2 U R2 U R2 U2 R'",
      "x' R2 D2 R' U' R D2 R2 D R U R' D' x",
      "y' R U2 R' U2 R U2 R' U' R U' R' U R U' R' U R U R'",
      "R2 U R2 U2 R' U' R U' R U' R U' R2 U2 R'",
      "y2 x R2 D2 R U R' D2 R2 D' R' U' R D x'",
      "y' B2 R2 B' r' U R2 U2 R U r B' R'",
      "y2 R' U' R U R U' R' U' R' U R U' R U' R' U2 R U R'",
      "y2 R' U2 R U R' U R U2 R U2 R2 U' R2 U' R2 U2 R",
      "L' U2 L U L' U L R U2 R2 U' R2 U' R2 U2 R",
      "y2 x' R2 U2 R D R' U2 R2 U' R' D' R U x",
      "R' F R F' U2 x' R U L' U' R U2 L U2 R2 x",
      "y R U2 R2 F R F' R' F R F L F L' F"
            ],
            "OxC": [
                "y2 R U R' U R' U2 R2 U R2 U R2 U' R'",
      "y2 R U R' U R' U' R U' R' U2 R U2 R U2 R'",
      "y2 R U R' U R' U' R U R U2 R' U2 R' U2 R",
      "y2 R U R' U' L' U' L U' R U2 R' L' U2 L"
            ],
            "OxO": [
                "y2 R U R' U R U2 R2 U' R U' R' U2 R",
				"L U L' U L U2 L2 U' L U' L' U2 L"
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                "M' U R' U' F' U F R2 U R' U R U2 r'",
      "F U R U2 R2 U2 R U R' U R U2 R U R' F'",
      "y F' U' L' U L F2 U R U' R' U R U' R' F'",
      "R U R' U R U2 R' U R U' R' U' R U R D R' U R D' R2",
      "M U' M' F R U R' U' F' M U M'",
      "y' f U R U' R' f' r' U r2 U' r2 U' r2 U r'",
      "y' R' U' F R' F' R U2 R S' R' U' R S",
      "R' U' F' U F R U' f R U R' U' R U R' U' f'",
      "R' U' F' U F R U F U R U' R' U R U' R' F'",
      "y F R U R' U' R' F' R U R' D' R U R' D R2 U2 R'",
      "y' R' U2 R F U' R' U' R U F' R' U2 R U R' U R",
      "y F R U R' U' F' U2 r' U r2 U' r2 U' r2 U r'",
      "y F R U R' U' F' l' U l2 U' l2 U' l2 U l'",
      "y S R' U' F' U F R2 U R' S' U R U2 R'",
      "y l' U l2 U' l2 U' l2 U l' U R' U' F' U F R",
      "y' F R U R2 D R' U' R D' U R U' R F'",
      "y' R' U2 R F u' R' U R u R' U R U' F'",
      "y S' R U' R' S R U2 x' R U' R' U F' R' x",
      "S R U2 R2 F R F r U r' S' F",
      "y' R2 D' R U R' D R U R U' R' U' R U R' U2 R U R' U R",
      "y F R U R' U' F' R' F R2 B' R2 F' R2 B R'",
      "R U R2 U' R2 U R U2 R' U' D R' U' R D' U2 R",
      "y' R' U' F R' F' R U R2 U R' S' R U' R' S"
            ],
            "AsC": [
                "y2 R2 D R' U' R D' R' U' R' U R U R'",
      "y' R' D' R U' R' D R2 U2 R' U R U R'",
      "y2 R' D R2 U2 R' U R U R2 D' R",
      "y2 R U2 R' B' U R U R' U' B",
      "x' r U2 r' D' F r U r' F' D x",
      "L U2 L' F' U L U L' U' F",
      "L2 D L' U' L D' L' U' L' U L U L'",
      "r U r' U' r' F r F' U' r U r' U' r' F r F'",
      "y2 R U2 R' U' L' U2 R U R' U2 L",
      "L U2 L' U' R' U2 L U L' U2 R"
            ],
            "AsO": [
                "y' F R U R' U' R U R' U' F' U' R' F' U' F U R",
      "y' r U' r2 U r2 U r2 U' r f R U R' U' f'",
      "y2 M U' M' F U R U' R' F' M U M'",
      "y' F R U R' U' R U R' U' F2 L' U' L U F",
      "y' R U2 R2 D' R U' R' D R U' R' F R U R U' R' F'",
      "y' R2 D R' U' R D' R2 U' R U' R' U2 R U' R' U R U R'",
      "y S' R' U R S R' U2 R' F R F' U R",
      "y2 R' U' R U' R' U2 R U' R' U R U R' U' R' D' R U' R' D R2",
      "F R U' R' U2 R' U' R U' R' U2 R2 U2 R' U' F'",
      "y' F' L' U' L U F r U' r2 U r2 U r2 U' r",
      "y2 F R' U R' U' D R' U R D' R2 U' R' F'",
      "y' r U2 R' U' R U' R2 F' U' F U R U' R r'",
      "y S' R U R' S R U' R2 U' R' F R F' U R",
      "R' F' U' F U r U' M2 U' M U2 M' U' M'",
      "y' R U B' R B R' U2 R' S' R U R' S"
            ],
            "CsA": [
                "y2 R' U R U R' U' R' D' R U' R' D R2",
      "y' F U' R' U R U F' R' U2 R",
      "y2 R D' R2 U R U R' U2 R2 D R'",
      "L' U L U L' U2 L2 D L' U' L D' L'",
      "y' F' R U R' U' R' F R U' F' R U R' U' R' F R U'",
      "L U2 R' U R U2 L' U' R' U2 R",
      "y2 R' U R U R' U2 R2 D R' U' R D' R'"
            ],
            "CsC": [
                "y2 R' U' F' U F U' R S' R' U R S",
      "y2 R' U' R U' F U' R' U R U R' U R U' F'",
      "L' U' L R U2 L' U L U L' U L R'",
      "y2 L' R U R' U R U L U R' L' U2 L",
      "y2 L' R U R' U R U R' U2 L R U' R'",
      "y2 R U R' U L' R U R' U' L U' R U' R'",
      "U2 R U R' U R U R' U2 R U' R' U2 R' D' R U R' D R",
      "L' U' L U' R U' L' U R' L U L' U L",
      "y2 R U R' U M F R' F' r U' R U' R'",
      "y2 R' U R U R' U' R' D' R U R' r U2 r' D R2",
      "y R U' R' U' R U R D R' U R D' R U' R U' R' U2 R",
      "f R U2 R2 U2 R2 U2 R U2 R U2 R' U2 f'",
      "y2 R' U' F' U F R2 U' R' S' R U R' S",
      "y2 M' U R' U2 R U R' U R2 z x' U R U' R' F'",
      "y2 R2 D r' U2 r R' U R D' R' U' R' U R U R'"
            ],
            "CsO": [
               "y' r U2 R2 F R F' U2 r' R U R U' R'",
      "y' F R U R' U' f' R U R' S R U' R'",
      "y R U R' U' M' U R2 B' R' B U' r'",
      "y' R U2 R2 F R F' U' S' R U' R' S",
      "y' R U2 R2 F R F' M' U' R U' R' U M",
      "y' r D U2 D' R2 F R F' U2 r' R U R U' R'",
      "y R U R' S' R U' R' f U R U' R' F'",
      "y' R U2 R' L' U R U' M' x' U' R U' R'",
      "y R D' R2 U R U' R' U2 R U R' U' R2 D R'",
      "y' L' U' L R U2 L' U' L R' U' R U' R'",
      "y' R U2 R' L' U R U' R' L U' R U' R'",
      "y' F R U R' U' R U R' U' F' U2 F R U R' U' F'",
      "y' R U B' R B R2 S' R U' R' S",
      "y L U2 L' R' U L U' L' R U' L U' L'",
      "y R U R' U R L' U R' U' R L U2 R'",
      "y' f R U R' U' f' R U R' U' M' U R U' r'"
            ],
            "CxO": [
                "F U R U2 R' U R U R' U R U2 R' U R U R' F'",
      "F R U' R' U' R U2 R' U' R U' R' U' R U2 R' U' F'",
      "y2 f U2 R2 U2 R2 U' S R2 S' U' R2 f'",
      "y2 F U2 R2 U2 R2 U' S R2 S' U' R2 F'",
      "y f R' F R2 f' r' U' f' U2 f U r U F'",
      "x' R U2 l' L' U2 L2 U R D L2 D' R' U L",
      "y R D' R2 U' F2 r2 D R2 U' F2 r2 D2 R'",
      "y x' U' R' D R D2 U R U R' D2 R U' R2 D' R x",
      "R' F' R f U2 f' R' F' L2 F2 R L U2 L'"
            ],
            "OsA": [
                "R U R' L' U2 R U' R' U' R U' R' L",
      "S' R' U' R S R' U F' U' F U R",
      "R U R' U L' U R U' R' L U' R U' R'",
      "R U L' R' U2 R U' R' U' R U' R' L",
      "y' F U R' U' R U' R' U' R U F' U R' U R",
      "R U R' L' U2 R U' R' U' R U' M' x'",
      "R U R' U r' F R F' M' U' R U' R'",
      "R2 D' r U2 r' R U' R' D R U R U' R' U' R",
      "f U2 R U2 R' U2 R U2 R2 U2 R2 U2 R f'",
      "S' R U' R' S R U R2 F' U' F U R",
      "R U R' U R' F R F' U' S' R U' R' S",
      "R U' R' U' R U R D R' U' R r' U2 r D' R2",
      "y2 R U2 R' U' R U' R' U R' U' R U' F U' R' U' R U F'",
      "R U R' U L' U R U' M' x' U' R U' R'"
            ],
            "OsC": [
                "y' R' U2 R F U' R' U R U R' U R U' F'",
      "y R' D R2 U' R' U R U2 R' U' R U R2 D' R",
      "y R' U' R' F R f' R U R' S R U' R' U R",
      "y2 R U R' U' M' U R U' r' R' U' F' U F R",
      "y R' U' R U' R' L U' R U R' L' U2 R",
      "y' R' U' F R' F' R2 S' R' U R S",
      "y l' U2 L2 F' L' F U2 l L' U' L' U L",
      "F U R' U' R U' R' U' R U F' R' U2 R",
      "y L' U2 L2 F' L' F U S L' U L S'",
      "y L' U2 L R U' L' U R' L U L' U L",
      "y S' R' U' R S R2 F R F' U R",
      "y R U R' L' U2 R U R' L U L' U L",
      "y' R' U2 L R U' R' U L' R U R' U R",
      "y R U L' R' U2 R U M' x' z R U' R U z'"
            ],
            "OsO": [
                "R U' R' U' R U R D R' U R D' R2",
      "y' B' U R U' R' U' B R U2 R'",
      "y F' U L U' L' U' F L U2 L'",
      "R U' R' U' R U2 R2 D' R U R' D R",
      "y2 L U' L' U' L U L D L' U L D' L2",
      "y R' F' U' F R f U R2 U' R' f'",
      "y b' R U R' U' R' F U R2 U' z'",
      "R' D R2 U' R' U' R U2 R2 D' R"
            ],
            "OxC": [
                "y' r U R' U' M U R U' R' F R U R' U' F'",
      "R' F' U' F U F R S R' F' R S'",
      "y F U R U' R' F' R U R' U' M' U R U' r'",
      "S' R U R' S R U' R2 F' U' F U R",
      "R' F' M U' M' F M U r",
      "y2 S R' F R S' R' F' U' F' U F R",
      "r U r' U R U' R' r U' r' F R U R' U' F'",
      "y' F R U R' F' r' U' R' F' R U r",
      "y r' U' R' F R U r F R U' R' F'",
      "R U B U' B' R' U R U R' U' M' U R U' r'",
      "y f U S' R S U' S' R' F'",
      "R' U' D R' U' R D' U R U R U R U' R'",
      "R' F' R r' U' r R' F R r' U r",
      "R' F' R U R U R' U' R' U' R' F R U R U R U' R'",
      "y R' F2 R U' R' U F2 R U2 R' F2 U' R U R' F2 R",
      "U2 R' U' F' U F R2 U R' S' R U' R' S",
      "y' F R U R' U' F' r U R' U' M U R U' R'",
      "y2 R U2 R' F' R U2 R' U' R' U' R' F R U R"
            ],
            "OxO": [
                "R2 D' R U R' D R U R U' R' U' R",
      "R' U2 R F U' R' U' R U F'",
      "R D' R2 U2 R U' R' U' R2 D R'",
      "R D' R2 U2 R U' R' U' R2 D R' U",
      "R' U2 R U2 R' F' R U R' U' R' F R2",
      "y' R D R' U R D' R2 U2 R U' R' U' R"
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                "R2 B2 R' B2 R' U R U' L U' L' U R'",
      "Lw2 F2 Lw' U2 Lw' U R U' L U' L' U R'",
      "R U R' U R U2 R' U R2 D' r U2 r' D R U2 R",
      "y' F R' U R' U' y R' F' R2 U' R' U R' F R F L'",
      "y R U' L U L' U R' U' l U2 R U2 R2 x",
      "L R U' R U R' D R D' R U' D R2 U R2 D' R2 L' U'",
      "R F U R' U' R F' R' U' R' F R f' R U R' S",
      "x' R2 U2 R' U2 R' F R F' r U' r' F l'",
      "R F U R' U2 R' F R f' R U R' S R F' R'",
      "y' F R' U R U' R' f' U' R U2 R' U' R U' R' f R F'",
      "y' L U' R U R' U L' U' L F2 L F2 L2",
      "L R U2 R' U2 L' U R U' L U' L' U R'",
      "x' R2 U2 R' U2 R' F R F' L F' L' F R' F2",
      "y' R' U' R' D' R U' R' D R2 U F R' U R U' F'",
      "R2 D' R U2 R' D R U2 R2 U R' F' R U R' U' R' F R2 U' R'",
      "x' R2 U2 R' U2 R' F R F' r U' r' F R' F2",
      "y2 R U R' U R' U' R D' R' D R' U D' R2 U' R2 D R2 U' R'",
      "y2 R L U2 L' U2 R' U L U' R U' R' U L'",
      "l R U2 R' U2 R' F R F' r U' L' U R'",
      "y2 R U R' U R U' R' f' U' R U2 R' U' R U' R' f R U' R'",
      "y2 F U' R' U R U' R' D' R U' R' D R U' F' R' U2 R",
      "y2 R2 D R' U2 R D' R' U R' U' R U R D R' U' R D' R' U2 R'",
      "y R U' L U r' F R' F' R U2 R U2 R l",
      "F L' U L' F L U' L' F U F U' F2 L2 F'"
            ],
            "AsC": [
                "r2 F2 r U2 r U' L' U R' U R U' L",
      "r' D' F' r U2 r U' r' f r' F' r S' r' D r",
      "y2 R' U' R U' R' U2 R U' R2 D r' U2 r D' R' U2 R'",
      "y' R U R' U' R U' R2 F2 U' R F2 R' U F2 R",
      "R2 D' R U2 R' D R U2 R' F R U R U' R' F' R U2 R' U2 R",
      "r2 F2 r U2 r U' r' F R' F R F' r",
      "y2 R2 F2 R F2 R U' R' U r' F r U' R",
      "y R' U L' U' L U' R U R' F2 R' F2 R2",
      "R' L' U2 L U2 R U' L' U R' U R U' L",
      "R' U' R U' R U R' D R D' R U' D R2 U R2 D' R2 U R",
      "y' L' U R' U' R U' L U r' U2 L' U2 r L",
      "r' L' U2 L U2 r U' L' U R' U R U' L",
      "F' R U' R F' R' U R F' U' F' U F2 R2 F",
      "L' U' L U' L' U2 L U' R' U2 R U R2 F' R U R U' R' F R",
      "y2 z U' D' R2 D R2 U R' D' R U' R U R' D z'",
      "y2 L' R' U R' U' y R' F' R2 U' R' U R' F R F y' L",
      "y2 L' R' U2 R U2 L U' R' U L' U L U' R",
      "L2 B2 L B2 L U' L' U R' U R U' L",
      "y2 R2 F2 R F2 R U' R' U L' U L U' R",
      "L' R' U2 L U2 R U' L' U R' U R U' L",
      "R U2 R D r' U2 r D' R2 U R' U2 R U R' U R",
      "y2 R2 D R' U2 R D' R' U2 R' x R2 F R F' R U2 r' U r U2 x'",
      "z D' U' R2 U R2 D R' U' R D' R D R' U z'",
      "y' F' U2 R U' R' U' F R' U2 R U2 R' F' R' F R2",
      "y' R U R' F' U' F R2 U' R' F U R' U' f' U' S",
      "y2 R F R2 U' f R' S' R2 F' U R2 U' F' R'",
      "y' r' F R' F' R F' r U r' U2 L' U2 L r",
      "r' L' U2 L U2 r U' r' F R' F R F' r",
      "y2 r' R' F R F' U R U2 R' U' R U' R' U2 R U R' U' r"
            ],
            "AsO": [
                "y F U R U2 R' U R U R2 F' r U R U' r'",
      "y R' U' R U' R' U2 R U' R' U2 R' D' R U2 R' D R2",
      "y' R' U2 R2 L U2 L' U' L U2 R2 U L' R",
      "R U R' U R U2 R' U R2 D' R U2 R' D R U2 R",
      "y' R' U2 R' U' F' U F R2 U' R' F R' F' R2",
      "y' f R2 D R' U R D' R U' f' R' F' U F R"
            ],
            "CsA": [
                "y' F2 R U' R' U' R U R' F' R U R' U' R' F R F2",
      "D R D' R2 F' R U R' f R f' R' U' F R2",
      "y2 R' U R U' x' U L' U L U2 R U' R' U x",
      "y R U R' U R U2 R2 F' R U R' U' R' F R2 U' R' U2 R",
      "y' F R2 U' R2 U' R2 U R' F' R U R2 U' R' F R F'",
      "y' F' L F L' F2 R' F' R F' U L' U' L",
      "R2 D' R U2 R' D R2 U R' U2 L U' R U L'",
      "y' F2 R U r U2 R2 F R F' R U2 r' R' F2",
      "y2 x' R' F R F' U L' U L U2 R U' R' U x",
      "L' U L2 U L2 U' L2 D L2 U' L2 U L2 D' L",
      "R D' R2 F' R U R' f R f' R' U' F R2 D",
      "y2 R' U R U' R' U F R f' U f R F' R2",
      "y2 R' U R U' f U' f R f2 R f' U' f",
      "y2 R' U R U' B r' U L U2 R U' R' U x",
      "y' R' F2 R U' R' U' R U R' F' R U R' U' R' F R F2 R",
      "L' U L U' x U R' U R U2 L U' L' U x'",
      "L F' L' U L U L' U' L F L' U' L U L F' L' F L'",
      "y2 S U2 f' U' f R U2 R' f' U2 f R' F R f'",
      "y S' U' f U2 R' U' f R' f' U R2 U' R' F'",
      "y' F R U R2 U' f R f' U R U2 f' U S",
      "y2 R' F R F' R2 f' U' f R' U F' U' F",
      "y' S U' F R2 U' R' F R' F' R U2 R' U' f'",
      "y2 R' U R2 f' U F R U' R' f R F' R2"
            ],
            "CsC": [
                "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R",
      "y F R' F' R F2 r U r' F U' R U R'",
      "y2 R2 D R' U2 R D' R2 U' R U2 L' U R' U' L",
      "R U' R2 U' R2 U R' F' R U R2 U' R' F R2",
      "R U' R2 U' R2 U R2 D' R2 U R2 U' R2 D R'",
      "R U' R' U F' r U' r' F2 R' F R F'",
      "R U' R' U R U' f' y' U' R U' R' U' z U R2",
      "R U' R2 U' R2 U F U F' R2 F U' F' R",
      "R U' R2 F R' f' R' U R F' U' f R2",
      "y R U' r' f R' F2 R S' R' U' F U r",
      "y2 L U' L' U x' U' R U' R' U2 L' U L U' x",
      "R U' R' U x U' L U' L' U2 R' U R U' x'",
      "y2 R2 D R' U2 R D' R' U' R' F' R U R' U' R' F R2 U' R'",
      "R U' R' U R U' x' U' z' U' R U' R' U' z U R2",
      "R' F U F' R2 F U' F' U' R2 U R2 U R'",
      "R U' R' U' R2 D R' U R D' R2 F' R U R' U' R' F R",
      "R' D' R U' R' D R2 U' R' U R U R' U' F' R U R' U' R' F R",
      "R' F R U r U2 R2 F R F' R U2 r' R' F' R"
            ],
            "CsO": [
               "y' R2 F' R U R' U' R' F R2 U' R' U2 R2 U R' U R",
      "R U' R' U R U' L U L' U x' U2 R U2 R2 x",
      "y' R' U' F U R U' R' F' R f R' F' R U R U' R' S'",
      "y2 R2 D R' U2 R D' R' U' R' U' R' F R2 U' R' U' R U R' F'",
      "R2 D' R U2 R' D R U2 R2 U R' U' R' F R2 U' R' U' R U R' F'",
      "y' S' R' U' F U R U' R' F' R f R' F' R U R U' R'",
      "y R' B2 R2 U R' U R U' R2 B2 R U2 R U R'",
      "y2 F U R U' R' F' R f R' F' R U R U' R' S' R'",
      "f R' F2 R S' R' U' F U r U2 R U' r'",
      "y2 R' U R U' R' U L' U' L U' x U2 R' U2 R2 x'",
      "y2 R' U R U' R' U L' U' L U' F2 R' F2 R2",
      "U' R' F' R U R' U' R' F R2 U' R' U2 R2 U R' U R U2 R'",
      "y2 R U2 x R U2 R U2 r' U2 L U2 R' U2 R U2 R' U2 R'",
      "y2 R' U2 r U2 r' F2 R2 U2 R U2 R' U2 F2 R2 F2",
      "y2 R U2 x R U2 R U2 R' U2 L U2 r' U2 R U2 R' U2 R'",
      "U2 r U2 x r U2 r U2 r' U2 Lw U2 r' U2 r U2 r' U2 r'",
      "R U2 R U R' D R D' R2 U' R2 D R2 U R D' R U R'",
      "y2 R' U2 L F2 L' F2 R2 U2 R U2 R' U2 F2 R2 F2 U2",
      "R' F' r U2 R B U B' r' S' r U2 r' f",
      "y R U R' U' R U R' U' R U R' F' R U R' U' R' F R2 U2 R' U R U' R'",
      "U2 R' U2 L F2 L' F2 R2 U2 R U2 R' U2 F2 R2 F2",
      "y2 r U2 x r U2 r U2 r' U2 l U2 r' U2 r U2 r' U2 r'"
            ],
            "CxO": [
                "y' R' U' R F R2 D' R U R' D R2 U' F'",
      "y' B' U' R2 D R' U R D' R2 B R U' R'",
      "y R' F' r U R U' r2 U' r F r' U r",
      "y l' U' L U l F' L' F R U R' U' R' F R U R U' R' F'",
      "y' R' U' R F R' U R U' R' F' r U R U' r'",
      "y2 R' U' R' D' R U R' D R2 U R2 D R' U R D' R' U' R'",
      "L' U' L U' L' U2 L R U R2 D' R U R' D R2 U2 R'",
      "y R' U2 R2 D R' U R D' R2 U R U2 R U2 R' U' R U' R'",
      "R D r2 U' R U r2 D2 R U2 R' D R U2 R"
            ],
            "OsA": [
                "y' r U R' U' r' F R2 U' R' U' R U2 R' U' F'",
      "L U L' F U' R U2 L U2 L' U2 R' U F'",
      "y' R2 D' R U2 R' D R U2 R U R' U2 R U R' U R",
      "y' R2 F R F' R U R2 F' U' F U R U2 R",
      "L R' U' R2 U2 L' U L U2 L' R2 U2 R",
      "y' S' R2 F R F' R U2 R' F' U2 F R S",
      "R' F' U' F R f U R' D R' U' R D' R2 f'"
            ],
            "OsC": [
                "y R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' U2 R",
      "F U R U' R' S U f' R' f R U' R' f' R",
      "R' U2 F' R U R' U' R' F R2 F U' R' U' R U F'",
      "y2 D' R U2 R' U2 R' U D R2 D' R' D R2 U' R",
      "R' U2 R U R' U R U2 R U2 R D r' U2 r D' R2",
      "y F' R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R' F",
      "R' U2 R U2 D' R U' R2 D R' D' R2 U D R'",
      "R2 D' R U2 R' D R U F' R U R' U' R' F R2 U' R' U' R U R' U R",
      "y R U2 r' F M' U' R U2 r' F R' F r",
      "R' U2 F' R U R' U' R' F R2 U2 R' F' R U R' U' R' F R2",
      "y2 R U2 R' U R' F R F' R U' R' F' U F R U R'",
      "y' R' F R F' R U' R' F' U F R U R' U' R U2 R'",
      "L U R' U L' U2 R U' M' x' U L' U2 R",
      "R' F' R U R' U' R' F R2 F U' R' U' R U F' R' U2 R",
      "y2 F R U R' U' S D' R' F' R D f' R' F R",
      "r2 U' r U r2 F2 R U R' F2 r F' U r2",
      "R' U2 R U R' U2 R U R2 F' R U R U' R' F R U' R' U' R",
      "L U R' U L' U2 R U' R' L U L' U2 R",
      "r2 D r U2 r' D' r U' r' D r U r' D' r U r' D r U r' D' r U R U2 M'",
      "y' L U2 R' U R L' U' L U2 R' U L' U R",
      "y R' U' R' U' R U F' U' F U' R' U2 F R F' U R",
      "z U R D' R U' R2 D R' U D' R U' R2 D z'",
      "L U R' U L' U2 R U' M' B r' U2 R",
      "R' U2 R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R",
      "y F2 R U R' U' R' F R2 F U' R' U' R U F' R' F",
      "y2 R U2 R' U2 z' U' R U R' F' R U R' U' R' F R2 U' R' L",
      "y2 R2 B2 R' U2 R' U2 x' U2 R' U2 R U2 R' U2 R2 U2 x"
            ],
            "OsO": [
                "y' R2 D R' U2 R D' R' U2 R' U' R U2 R' U' R U' R'",
      "R2 F R U R U' R' F' R U' R2 D' R U R' D R2",
      "y' R2 U2 R U D' R' U R2 U2 R2 D R2 D' R' D",
      "y R' F' r U R U' r2 F r U r' F2 r U F",
      "y F U R U2 R' U R U2 R' U' R' F' R U2 R U2 R'",
      "y' R' D' R U2 R' D R U R U2 R' U R U2 R' U R U2 R'",
      "y2 R U R' F R2 U R' D R2 D' R U' R2 F'",
      "F R U R U2 R' U' R U' R' U2 R' U2 R U' R' U' F'",
      "R' L U L2 U2 R U' R' U2 R L2 U2 L'",
      "y z F U' F2 U' R' U' R2 U R' U' R' U2 F2 U F'",
      "y' S' F R U2 R' S F' U2 f R' F R F' f'",
      "y f R' U2 R' D' R U2 R' D f' U' f R' f'"
            ],
            "OxC": [
                "y' F U R2 D' R U' R' D R2 F' R' U R",
      "y' R U R' B' R2 D R' U' R D' R2 U B",
      "y2 r' U' r F' r' U r2 U R' U' r' F R",
      "R U R D R' U' R D' R2 U' R2 D' R U' R' D R U R",
      "y L U L' F' L U' L' U L F l' U' L' U l",
      "y' r U R' U' r' F R U R' U' R F' R' U R",
      "R' F' R U R' U' R' F R U R U2 R2 D' R U' R' D R U R",
      "R U R' U R U2 R' U2 R' U' R2 D R' U' R D' R2 U2 R"
            ],
            "OxO": [
                "y' R U2 R' U2 R' F R U R U2 R' U' R U2 R' U' F'",
      "y' F' U' r' F2 r U' r' F' r2 U R' U' r' F R",
      "y R U R' U R U2 R' U R U2 R D R' U2 R D' R2",
      "y R2 D' R U' R' D R2 U R' F R U R' U' R' F' R2",
      "y2 S' R B U2 B' R' U2 R U R2 F R F' U' S",
      "y' R U2 R2 L' U2 L U L' U2 R2 U' L R'",
      "y2 F R2 U R' D R2 D' R U' R2 F' R U' R'",
      "y' R2 D' R U2 R' D R U2 R U2 R U R' U R U2 R'",
      "L' U' L U' L' U2 L U' L2 D L' U2 L D' L' U2 L'",
      "y' F' U' L' U2 L U' L' U' L2 F l' U' L' U l",
      "y' R U2 R' U' R U2 R' U' R U2 R' U' R' D' R U2 R' D R",
      "y2 S' R B U2 B' R' U2 R B' R B R2 S",
      "U R2 D' R U' R' D R2 U R' F R U R' U' R' F' R2",
      "y R U' F U' F' U2 R' U F S' R U2 R' F' S"
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                "y2 R U' R2 F R U R U' R2 F' R U' F' U F",
      "y F' R U R' U' R' F R2 U R' U2 R U R' U2 R U' R'",
      "y' R U' R' U R' D' R U' R' D F R f' R U R' S",
      "y R U2 F R U R U' R U R2 U' F' U2 R'",
      "y R U2 x U2 R U' R U R2 U' R U' x' U2 R'",
      "R' L' U R U' R' L U' R U2 R U R2 U R2 U2 R'",
      "y' F2 U' R' F r2 U R2 F R U' M2 F"
            ],
            "AsC": [
                "R' U2 R U R' U R' D' R U' R' D R U R",
      "R' U2 R U R D R' U' R D' R' U R' U R",
      "R' U2 R U R' U R U' F' r U R' U' r' F R",
      "y2 R U' R' U F' r F R' U' R F' r' F",
      "r' D' F r U r' F2 r U r' D r",
      "L' F' U L U L' U2 L U L' F L",
      "y2 R' U R U R' U2 R U2 R D R' U R D' R'",
      "U2 L' U2 L U L D L' U' L D' L' U L' U L",
      "y2 R U2 r' F R' F' r U2 r' F R F' M'"
            ],
            "AsO": [
                "R' U' R U2 R' F' R U R' U' R' F R2 U2 R' U R",
      "R' U' R F U' R' U' R U F' U R' U R",
      "R' U' R U L U2 R' U' L' U' L R U2 L'",
      "R' U' R U' R' U' R U2 R' U R2 D R' U R D' R'"
            ],
            "CsA": [
                "R U R' U R U' R' U2 R' D' R U2 R' D R2 U' R'",
      "y' R U2 R' U' R U' R D' R U2 R' D R U2 R",
      "y f R' f' R' f' R U R' S U' R' F R2",
      "R2 B2 R' U2 R' U' R2 B2 R2 U' R B2 R'",
      "y2 R' D R2 U' F U' R' U R U F' R2 D' R",
      "y2 R U' R' U R S' R' U R U B U' F' r' F' z",
      "y2 R U' R' U R S' R' U R U f R' F' U' R'",
      "y2 L2 F2 L' U2 L' U' L2 F2 L2 U' L F2 L'"
            ],
            "CsC": [
                 "x' R2 D2 R' U2 R D2 R' U2 R' x",
      "y2 x L2 D2 L' U2 L D2 L' U2 L'",
      "y2 R U2 R' U2 L' U2 R U2 R' U2 L",
      "y2 R U' D' R' D' R U2 R' D R U' D R'",
      "y2 R U' R' U2 R U' R' y' R' U R U R' U2 R",
      "y' F U2 R' D' R U2 R' D R F'",
      "R U R' U' R U R' U' R U R' U' R' F R F' R' F R F' R' F R F'",
      "R B2 R' U2 R' U2 R B2 R' U2 R",
      "y R' U R' F R U R U' R' F' R U R' U2 R"
            ],
            "CsO": [
               "y' R U' R' U' R U' R' U R' D' R U R' D R2 U R'",
      "y R U R' U R U2 R' U' R2 D' R U' R' D R U R",
      "y F' r U R' U' r' F R2 U R' U R U2 R'",
      "y' R U2 R' U' R U' R D' r U2 r' D R U2 R",
      "y R U R' U R U2 R' U2 F' r U R' U' r' F R",
      "y R U R' U R U' R U' L' U R' U' L R'",
      "y2 S' r' F2 r F' r U r' U2 r U' r' f",
      "f l U' R U R' U R' D' R U' R' U' D z'",
      "y2 f R U' R2 D R' D' R2 U f' R U' R'",
      "F R U' R' U S' R U R' S U R U' R' F'",
      "y L U2 L' U2 R U' R' U2 L U' L' U R U' R'",
      "y F' R U R' U' R' F R' U R2 U R U' R U' R2",
      "y2 R2 D' R U' R' D R U R U' R U R' U R U2 R'"
            ],
            "CxO": [
                "y2 R U R' U R U R' U2 R U' R2 D' R U' R' D R",
      "y2 R U R' U' L' U2 R U R' U2 L R U' R'",
      "y2 F U R U' R' S' R U' R' S U R U2 R' U' F'",
      "y' F U S U2 R F' R' U2 R F R' S' U' F'",
      "L U L' U' R' U2 L U L' U2 L R U' L'",
      "y2 R U R' B' U R U R' U' B U' R U' R'",
      "y2 R U' R' U r' D' r U2 S U S' r' D r"
            ],
            "OsA": [
                "R U R' U R' D' R U2 R' D R2 U' R' U2 R U2 R'",
      "y' R' U R U R' U R U' R D R' U' R D' R2 U' R",
      "y' R' U2 R U R' U R' D r' U2 r D' R' U2 R'",
      "y R' U' R U' R' U2 R U' R U R' U' R' F R U R U' R' F'",
      "y2 S R U2 R' F R' F' R U2 R' F R f'",
      "y R' U' R U' R' U2 R F l' U' L U R U' r'",
      "y R' U' R U' R' U R' U L U' R U L' R",
      "y' F R' F' r U R U' r2 F' r U' r' F2 r",
      "y' z U' R' U R' U' R U' R D R' U R E x'",
      "y L' U2 L U2 R' U R U2 L' U L U' R' U R",
      "y' R' U2 R U2 L' U L U2 R' U R U' L' U L",
      "y' z U' R' U R' U' R U' R D R' U R U D' z'"
            ],
            "OsC": [
                "y' R' U2 R U R' U R' D R' U2 R D' R' U2 R'",
      "y2 R' U' R U' R' U R U2 R D R' U2 R D' R2 U R",
      "y R2 D' R U2 R' D R U2 R U R' U' R U' R' U2 R",
      "y2 R2 F2 R U2 R U R2 F2 R2 U R' F2 R",
      "y2 R U R' U' R' U' F U R2 U' R2 F' R U R U' R'",
      "R' U2 R F U' D R' U R D' R' U2 R U F'",
      "L' U' L U' L' U L U2 L D L' U2 L D' L2 U L",
      "y2 R' U' R U' R' U2 R U R2 D' R U2 R' D R U2 R",
      "y' F U2 S R S' R' U R F' r' U F' U' r",
      "R' U R U' R' f' R' U' R f R' F' U F R2"
            ],
            "OsO": [
                "y2 x R2 D2 R U2 R' D2 R U2 R x'",
      "y2 R' F2 R U2 R U2 R' F2 R U2 R'",
      "U R U R2 U' R' F R U R2 U' R' F'",
      "R' U D R D R' U2 R D' R' U D' R",
      "R' U2 R U F U' R' U2 R U F'",
      "R' U R U2 R' U R y R U' R' U' R U2 R'",
      "x' L2 D2 L U2 L' D2 L U2 L x",
      "y R U R2 U' R' F R U R2 U' R' F'",
      "y F' U R' D R U2 R' D' R U F",
      "y F' R U2 R' U2 R' F R U2 R U2 R'",
      "R' U2 R U2 L U2 R' U2 R U2 L'"
            ],
            "OxC": [
                "R F U' R' U' R U2 R' U' R F' R'",
      "y2 R U2 R' U' R U' R D R' U R D' R' U' R'",
      "L U2 L' U' L U' L' R U R' U' R' F R U R U' R' F'",
      "y2 R U2 R' U' R U' R' U' F R' F' r U R U' r'",
      "L U2 L' U' L U' L D L' U L D' L' U' L'",
      "y2 R U2 R' U' R' D' R U R' D R U' R U' R'",
      "R U' R' U' R U2 R' U2 R' D' R U' R' D R",
      "R U R' F' R U R' F' R U R' U' R' F R2 U' R' F R U' R'"
            ],
            "OxO": [
                "F R U' R' U R U R' U R U' R' F'",
      "R U R' U' R' F2 R2 U' R' U' R U R' F2",
      "y2 R U R' U' R' F R F' R' U' F' U F R"
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                 "y' R' U2 R' D' R U2 R' D R U2 R U R' U R",
      "R U' R' U' R U R' U R U R2 F' R U R U' R' F",
      "y2 R2 D R' U R D' R' U R D r' U2 r D' R2",
      "y2 z U' R D R' U R U D' R U' R U R2 U' z'",
      "y2 L' U R U' L U R' L U L' U L U2 L'",
      "y2 F U R' F' r' D R D' r U F U2 F'",
      "R U' R' F R2 U F' R F U' R F' R",
      "R' U L U' R U L' R U R' U R U2 R'",
      "y R U R' U R U2 R2 U2 R' D' R U2 R' D R2"
            ],
            "AsC": [
                "y R2 D' R U' R' D R2 U' R' U2 R",
      "R' U R U2 R D r' U2 r D' R'",
      "y R' U' R2 D R' U' R D' R2 U2 R",
      "y' L' U' L2 D L' U' L D' L2 U2 L",
      "y' L2 D' L U' L' D L2 U' L' U2 L",
      "R2 F' R U R' U' R' F R2 U' R' U2 R U2 R"
            ],
            "AsO": [
                "R2 D' R U2 R' U' D R' U' R2 U R U R2",
      "y' R2 D R' U R D' R2 U' R U' R' U2 R U' R' U2 R U R'",
      "R' U2 F U F' R F U2 R' U' R U F'",
      "y' L U2 R' F R U' R U R' U F' R U2 R' L'",
      "R2 D' R' F2 R2 U2 R2 F2 R D R U2 R",
      "R2 D' R U2 R' D R U2 R' U' S R2 S' R2 U R2",
      "R2 U' S R2 S' R2 U D' R U2 R' D R U2 R",
      "R U' R' D R' U' R D' R2 U2 R2 U' R' U' R2",
      "y R U' R U D R' U R U2 R' U R D' R' U R'",
      "y' R U R2 D' R U R' D R U2 R U' R' U2 R U' R' U2 R U R'"
            ],
            "CsA": [
                "y2 R' U R U R' U2 R U R D R' U2 R D' R'",
      "L U L' U L U2 L2 U R U' L U R'",
      "y2 R U R' U R U2 R2 z R U R' D R U' z'",
      "y2 R' F R U R' F' R r' U' F2 U F r",
      "y2 R' F R U R' F' M U' F2 U F r",
      "z U R U' R U R2 U2 R D R' U R D' z'",
      "y2 R U R' U R U2 R2 U L U' R U L'",
      "y2 R U R' U R U2 R2 z R U R' D R U' R2",
      "y S' R' U' R S U' R' U R f R U R U' f'",
      "y2 r' F R F' r U R' U R' U2 R U R' U R"
            ],
            "CsC": [
                "R2 D' r U2 r' D R U2 R",
      "y F U R U' R2 F' R2 U' R' F' U' F R U R'",
      "y2 L2 D' l U2 l' D L U2 L",
      "R U R' U2 F U' F' U' R U' R' F U' F'",
      "R2 D' L F2 L' D R U2 R",
      "y2 R U' x R2 F R F' R U2 r' U r U2 R' x'"
            ],
            "CsO": [
             "y2 F R U R' U' R2 D R' U' R D' R2 U' R U R' F'",
      "y R B R' U2 R B' R2 D2 r U' r' D2 R",
      "R U' R' D R' U' R D' R2 U R' U' R' U2 R'",
      "R' F R U' R' F R U R' F R U' R' F2 R F U F'",
      "y2 R U R' U' R' U' R U F' U2 R' U2 R F R U' R'",
      "y l U l' U2 l U' l' R' D2 r U' r' D2 R",
      "R U' R2 U' R2 F' R U R' U' R' F U2 R'",
      "y2 F R U R2 D' R U' R' D R2 U' R' U' R U R' F'",
      "L U L' U' L' U' L U L U' F' L' U' L' U L F",
      "y R U2 F U F' R' U F U2 F' R U2 R'",
      "R U' R2 U' R D' R2 U R' U' R2 D R U2 R'",
      "y' R' U2 R' D' r U2 r' D R2 U R U R' U R U2 R'",
      "y2 R U R' U' R' U' R U R U' f' U' L' U' L U f",
      "y2 F U' R2 D R' U R D' R2 U R U' R' U2 R U R' F'",
      "R' F R U' R' F R U R' F R U' R' F2 R y' R U R'"
            ],
            "CxO": [
                "R' F' r U2 R' D R U' R' D' R2 U' r' F",
      "y' R' U2 R2 D R' U2 R D' R2 U R U2 R' U2 R",
      "S R2 S' D' R U2 R' D R' U2 R2 U2 R'",
      "R U' R' U F' R U R2 U' R' F R' U R U R' U' R U R",
      "y L U L' U' L U' L' U2 F' L U' L' U F L U2 L'",
      "y F U R U2 R' U R U2 R2 F R F' R U' R' F'",
      "y L' U2 L2 D L' U2 L D' L2 U L U2 L' U2 L",
      "y R' U R U2 L' R U' L U R2 U2 L' U2 L R",
      "y' z U' R U R2 U D' R' D R U2 R2 D' R2 U D z'",
      "y' R U R' U R U' R' U R U' R' U' R' F' R U2 R U2 R' F"
            ],
            "OsA": [
                "y' R' U R U' R' U' R U2 R D R' U' R D' R2 U' R",
      "y R' U' R U' R' U R F U' R' U' R U F' R' U2 R",
      "R D R' U2 R D' R' U R' U R U' R' U' R U R' U' R",
      "R2 F2 R2 U R2 F2 R2 U' R2 U' R F2 R' U R F2 R",
      "y L' U L U' L' U' L U L' U' L U L' U' R' U L U' R",
      "y' F R U R U' R y R U R' U F U2 F L'",
      "y f U R U R' U F R F' R U R2 U f'",
      "F' U' R U2 R2 D' F D U' R U' R' U2 F R",
      "y2 f U2 r F' R U R' U' R' F M U2 f'"
            ],
            "OsC": [
                "R D r' U2 r D' R' U2 R' U R U R' U R",
      "y' R' U R U R' U2 R y U2 R U' R' U2 R U' R'",
      "y' R' U R U R' U2 R U' D' R U' R' U2 R U' R' D",
      "R2 F2 r U' R U R' U M F R' F R2",
      "y R B U' B' U' R2 u' R U' R U R' u R",
      "y L' U L U L' U2 L U2 y L U' L' U2 L U' L'",
      "y2 R' U' R U R' U' R2 D R' U' R D' R2 U' R U R' U R",
      "y' R' U R U R' U2 R D' U' R U' R' U2 R U' R' D",
      "y R f R' f' U' R2 u' R U' R U R' u R",
      "y2 R' S' U R U R' U S R f' R' U2 R f"
            ],
            "OsO": [
                "F U R U' R D R' U' R D' R2 U R U R' F'",
      "y' R U R' U2 F2 R U2 R' U2 R' F2 R2 U R'",
      "y R2 U' R2 U' R U2 D' R U' R' U' D R U R2",
      "y R' U' R U' R' U R U' R' U R U L U' R' U R L'",
      "F U R U' R' U R' D' R U' R' D R2 U' R' U R U R' F'",
      "y R' U' R U' R' U R U' R' U R F R' U R U' F'",
      "y L U L' U R' U L U2 R U2 L' U R' U2 R",
      "R' U' R f U' R D R' U R U D' R2 U' R' f'",
      "y' L' U' L U' L' U L U' L' U L f U' R U R' f'",
      "R' U F' R U2 R' U' R U' R' F U2 R U2 R' U' R",
      "y' R U R' U L' U R U2 L U2 R' U L' U2 L",
      "y' R' U' R U F R' U R U' F' r' R' F R F' r",
      "f R' F R f' F' R' U2 R U F R' U R F'",
      "R2 D' R U2 R' D R U2 R' U R U R' U' R' U' R' U R'",
      "F U R U' R' U R U' R' U' R2 D R' U R D' R2 U F'",
      "F U R U' R' U R U' R' U' R U R2 D' R U R' D R F'"
            ],
            "OxC": [
                "R2 D' R U2 R' D R U2 R"
            ],
            "OxO": [
                "y' R2 F' R U2 R U2 R' F U' R U R' U' R",
      "y R U L' U R' U' L U' R U R' U R U' R'",
      "y S' F R U' R' f R' F' R U2 R U' R' F'",
      "R2 D' R U2 R' D R U' R' U' R' U' R' U R U R2",
      "y' L U R' U L' U' R U' L U L' U L U' L'",
      "r' B r U' r2 U R B2 R U R2 U r2",
      "y R U r' F R' F' r U' R U R' U R U' R'",
      "L' D L U' L2 D l u2 r U L2 U l2"
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                "y2 R' D' r U2 r' D R U2 R U' R' U' R U' R'",
      "R U R' U' R U R2 D' R U R' D R2 U R' U' R U' R'",
      "y' R U' R' U' R U2 R' U D R' U R U2 R' U R D'",
      "R U R' F' U' F2 D R' U R' U' R D' F'",
      "y' f R f' R' U' R2 u R' U R' U' R u' R'",
      "y' R U' R' U' R U2 R' U2 y' R' U R U2 R' U R",
      "R U R' y' R' U' R2 u R' U R' U' R u' R'"
            ],
            "AsC": [
                "y2 R2 D r' U2 r D' R' U2 R'",
      "R' U2 R U R2 F' R U R U' R' F R",
      "R' U R U R' F' R U R' U' R' F R2 U' R' U' R",
      "L2 D l' U2 l D' L' U2 L'",
      "y F' R U R' F' R U R' U' R' F R2 U' R' F",
      "R' U L' U R U' L U2 R' U R"
            ],
            "AsO": [
                "y R U R' U R U' R' U R U' R' U' L' U R U' R' L",
      "y R U R' U R U' R' U R U2 R' r U R' U' r' F R F'",
      "y R U R' U R U' R' U R U' R' U' r' F R F' M'",
      "y R' U2 R U R' U R F U R' U' R F' U' R' U2 R",
      "y R' F R F' U R' D' r U' r' D U' F' U F R",
      "R U2 R2 D' R U' R' D R2 U' R2 U' R U' R' U2 R",
      "S' R U R' F' U f R S' R U' R' f R' F'",
      "y R2 U R2 U R' U2 D R' U R U D' R' U' R2",
      "y R U R' U R U' R' U R U' R' f' U L' U' L f",
      "y L' U' L U2 F2 L' U2 L U2 L F2 L2 U' L",
      "y' R' U' R U' R2 D' R U R' D F' R U R U' R' F R",
      "y' R' U' R U' L U' R' U2 L' U2 R U' L U2 L'",
      "y' R' U' R U2 x' U2 l' U2 R U2 l U2 R' l' U' R",
      "y L' U' L U' R U' L' U2 R' U2 L U' R U2 R'",
      "y2 R2 U' R' U R U R' U2 D R' U R D' R U R2",
      "F R U R' U S F' U' R' F U' F' U R S'",
      "y' F U' R U R2 U' R U' R' U2 R U' R U' R' U F'",
      "y' R' U' R U2 B2 R' U2 R U2 R B2 R2 U' R",
      "y2 R2 D R' U2 R D' R' U2 R U' R' U' R U R U R U' R"
            ],
            "CsA": [
                "y' R U R' U R U' R' U F' R U2 R' U2 R' F R",
      "y2 R2 D R' U2 R D' R' U R U R U R U' R' U' R2",
      "R D' R' U R2 D' r' D2 r' U' r2 D' R2",
      "y R' U' L U' R U L' U R' U' R U' R' U R",
      "y R U R2 D' R U' M' U2 r' D R2 U2 R'",
      "y S' R U R' S2 U R U' F D R' D' R' B' z'",
      "y R' z R' U R' D R U' R D' R' D R' D' R D",
      "y2 R2 F2 R2 U R U2 R' U' R U R F2 R' U2 R'",
      "y2 U' F' R2 F U' F2 U2 F2 U' F2 U' F R2 F U'",
      "y R' U' R U' F U R' U' R F' U2 R' U' R U' R' U R",
      "R D' R' U R2 D' r' u2 l' U' R2 U' r2"
            ],
            "CsC": [
                "y2 R2 D R' U2 R D' R' U2 R'",
      "L2 D L' U2 L D' L' U2 L'",
      "U2 R2 D R' U2 R D' R' U2 R' U2",
      "x' R U' R' D R U2 R' D' R U' R' x"
            ],
            "CsO": [
               "y R U R2 D' R U R' D R2 U2 R'",
      "y R2 D R' U R D' R2 U R U2 R'",
      "U R U R2 D' R U R' D R2 U2 R'",
      "y2 R U' R' U2 R' D' r U2 r' D R",
      "U2 R U R2 D' R U' R' D R2 U' R' U R U' R'",
      "y R U R' U R U' R' U' R' F R U R U' R' F'"
            ],
            "CxO": [
                "y' R U' R' U R U R' U2 R' D' R U R' D R2 U R'",
      "R' U2 R U F' R' D U' R U R' D' U R F",
      "y' R U' R' U R U R' U' R U R' U' R U L U' R' U L'",
      "y F' L' U' L' U L' y' L' U' L U' F' U2 F' R",
      "R F2 U' R2 U' R U2 R' U' R U' R U F2 R'",
      "y2 F U R F R' F R D R' D' F2 U' R' F'",
      "y2 R' D' R U2 R' D R U' R U' R' U R U R' U' R U R'"
            ],
            "OsA": [
                "y' R U2 R D R' U2 R D' R' U2 R' U' R U' R'",
      "y2 S R U' R' U' F' U2 F U R U' R' S'",
      "y2 R U' L' U R' U' L R' U' R U' R' U2 R",
      "S' U f U' f' U' f U' F' U' L' U2 L",
      "y2 R U' R' U' F' U2 R' F' U F R f R' S'",
      "z U R' D' R U' R' D U' R' U R' U' R2 U z'",
      "L U' R' U L' U' R L' U' L U' L' U2 L",
      "L U' R' U L' U L U2 L' U' L U' L' R"
            ],
            "OsC": [
                "y' R2 D' R U' R' D R2 U R' U R U2 R' U R U2 R' U' R",
      "y R2 U F' R2 U' R2 U' R2 U2 R2 U' F U' R2",
      "y' F U2 R' U' R F' R' U2 F U F' U' R",
      "y R' U R' U' D' R U' R' U2 R U' R' D R U' R",
      "y2 R2 D R' U2 R U D' R U R2 U' R' U' R2",
      "y R' U R' D' U' R U' R' U2 R U' R' D R U' R",
      "y F' R2 u R' U R' U' R u' R2 F' U F2",
      "L2 D L' U2 L U D' L U L2 U' L' U' L2",
      "y2 R' U R D' R U R' D R2 U2 R2 U R U R2",
      "y' R' U' R2 D R' U' R D' R' U2 R' U R U2 R' U R U2 R' U' R"
            ],
            "OsO": [
                "y' R U2 R2 D' R U2 R' D R2 U' R' U2 R U2 R'",
      "r U R' U R' D' R U R' D R U r' F R F'",
      "R' U' R U' R' U2 R2 U R' U R U' R' U' R' F R2 U' R' U' R U R' F'",
      "y2 S R2 S' D R' U2 R D' R U2 R2 U2 R",
      "y2 x' R U L' U2 R D' R' U R D R2 U L U' x",
      "y R U' r2 B2 r U r' B2 r U' F R' F' r",
      "y' R' U' R U R' U R U2 F R' U R U' F' R' U2 R",
      "y' R' U R U R2 U' R U' R' U2 R2 U2 R D R' U R D' R'",
      "y F' U' F R' D' r U r' D R F U R U' R' F'",
      "R' U2 R U F U' D R' U R D' R' U R U F'",
      "y F' R U' R' D' R F U' F' R' U' D R U' R' F",
      "y' F' U' L' U2 L U' L' U2 L2 F' L' F L' U L F"
            ],
            "OxC": [
                "R U' R' U' R U2 R' U' R' D' R U2 R' D R",
      "R' U' R U' R' U2 R2 U' L' U R' U' L",
      "y F R' F' U' F R S U R2 U' R' f'",
      "R' U' R U' R' U2 R2 U' r' F R' F' r",
      "R' U R' U' R D' F2 U2 F2 R U R' D",
      "y' f R' f' R U' L' U R' U' L f R2 f'",
      "y f R U R D R' U' R D' f' U' f R' f'",
      "y2 r U' r' U' r U r' F R' F' R U R U2 R'",
      "R U R' U' R' F R U R U2 R' U' R U2 R' U' F'",
      "y2 r U' r' U' r U M f R2 f' U' R'",
      "y2 z U' R' U R' U' R2 U2 R' D' R U' R' D",
      "y2 L' U' L U' L' U2 L2 U' R' U L' U' R"
            ],
            "OxO": [
                "R' U' R U R U R' U' R' U F R U R U' R' F'",
                "U R' F' R U2 R' F R2 D2 r' U r D2 R'",
                "y2 R' U R D' R U R' D R2 U' R U R U2 R",
                "y R' F' R U2 R' F R2 u2 R' F R u2 R'",
                "R U R D R' U2 R D' R' U2 R' U' R U' R' U' R U R'"
            ]
        },

        
    },

    // This is for the L ZBLL set
    "L": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the  ZBLL set
    "": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the  ZBLL set
    "": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the H ZBLL set
    "H": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the Pi ZBLL set
    "Pi": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the  ZBLL set
    "Sune": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

    // This is for the  ZBLL set
    "Antisune": {
        // LRFF
        "2GLL": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },
		
		// FFLR
        "Diag": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BBFF
        "3": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// BFFB
        "4": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// FRLF
        "5": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

		// LFFR
        "6": {
            "AsA": [
                
            ],
            "AsC": [
                
            ],
            "AsO": [
                
            ],
            "CsA": [
                
            ],
            "CsC": [
                
            ],
            "CsO": [
               
            ],
            "CxO": [
                
            ],
            "OsA": [
                
            ],
            "OsC": [
                
            ],
            "OsO": [
                
            ],
            "OxC": [
                
            ],
            "OxO": [
                
            ]
        },

        
    },

}