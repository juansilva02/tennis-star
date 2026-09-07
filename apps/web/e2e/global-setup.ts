import { cleanupE2eArtifacts } from "../../api/test/cleanup-e2e-artifacts";

export default async function globalSetup() {
  await cleanupE2eArtifacts();
}
