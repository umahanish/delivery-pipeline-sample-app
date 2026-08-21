// lcov specifically because that's what SonarCloud's scanner reads
// (sonar.javascript.lcov.reportPaths in sonar-project.properties) --
// text is kept too so `npm run test:coverage` still prints a readable
// summary locally.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
