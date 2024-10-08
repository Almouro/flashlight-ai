module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // we already get TS errors with tsc, so no need to have them here
        diagnostics: false,
      },
    ],
  },
  testPathIgnorePatterns: ["/dist/"],
};
