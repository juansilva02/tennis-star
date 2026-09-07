import { cleanupE2eArtifacts } from "../../api/test/cleanup-e2e-artifacts";

export default async function globalTeardown() {
  await cleanupE2eArtifacts();
}
