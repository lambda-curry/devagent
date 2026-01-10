import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

CONVERTER_PATH = Path(__file__).resolve().parents[1] / "tools" / "convert-plan.py"
spec = importlib.util.spec_from_file_location("convert_plan", CONVERTER_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)
convert_plan = module.convert_plan


SAMPLE_PLAN = """
# Sample Plan

### Implementation Tasks

#### Task 1: First Task
- **Objective:** Do something important.
- **Dependencies:** None
- **Acceptance Criteria:**
  - It works.
- **Subtasks (optional):**
  1. Subtask A
  2. Subtask B

#### Task 2: Second Task
- **Objective:** Do the next thing.
- **Dependencies:** Task 1
- **Acceptance Criteria:**
  - It is complete.
""".strip()


class ConvertPlanTests(unittest.TestCase):
    def test_convert_plan_generates_epic_and_tasks(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            plan_path = Path(tmpdir) / "plan.md"
            output_path = Path(tmpdir) / "beads.json"
            plan_path.write_text(SAMPLE_PLAN, encoding="utf-8")

            payload = convert_plan(plan_path, output_path)
            stored = json.loads(output_path.read_text(encoding="utf-8"))

        self.assertEqual(payload["metadata"], stored["metadata"])
        self.assertEqual(len(payload["epics"]), 1)
        self.assertGreaterEqual(len(payload["tasks"]), 4)
        second_task = [task for task in payload["tasks"] if task["title"] == "Second Task"][0]
        self.assertEqual(second_task["depends_on"], [payload["tasks"][0]["id"]])


if __name__ == "__main__":
    unittest.main()
