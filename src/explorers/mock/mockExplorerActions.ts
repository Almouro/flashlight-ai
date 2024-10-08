import { ActionType } from "../../controllers/actionController";
import { StopType } from "../../controllers/stopController";

export const mockExplorerActions: (ActionType | StopType)[] = [
  {
    actionIndex: 0,
    info: {
      description:
        "Tapping on the 'Enter your name' input field to type in a name.",
      explanation:
        "I want to enter a name to see what happens after this action.",
      previousActionAnalysis: "No previous action was taken.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1151,
      },
    },
  },
  {
    actionIndex: 1,
    info: {
      description: "Typing the name 'John Doe' in the input field.",
      explanation:
        "I want to see how the app reacts to entering a name in the field.",
      previousActionAnalysis: "Tapped on the input field to enter text.",
    },
    action: {
      type: "text",
      data: {
        text: "John Doe",
      },
    },
  },
  {
    actionIndex: 2,
    info: {
      description: "Tapping the 'Start Quiz' button to begin the quiz.",
      explanation:
        "I want to see if the button becomes interactive after entering a name.",
      previousActionAnalysis: "Typed 'John Doe' in the name input.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1295,
      },
    },
  },
  {
    actionIndex: 3,
    info: {
      description:
        "Selecting the answer 'Droidcon London' to the current quiz question.",
      explanation: "I want to test if the quiz allows selecting an answer.",
      previousActionAnalysis:
        "Tapped the 'Start Quiz' button, and the quiz question appeared.",
    },
    action: {
      type: "tap",
      data: {
        x: 480,
        y: 1525,
      },
    },
  },
  {
    actionIndex: 4,
    info: {
      description: "Selecting the answer 'Paris' to the current quiz question.",
      explanation:
        "I want to confirm if advancing to the next question works by selecting the right answer.",
      previousActionAnalysis:
        "Selected 'Droidcon London' which changed the displayed question.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1690,
      },
    },
  },
  {
    actionIndex: 5,
    info: {
      description:
        "Selecting the answer 'London' to the current quiz question.",
      explanation:
        "I want to see how the app handles the selection of the final answer and what happens next.",
      previousActionAnalysis:
        "Selected 'Paris' as the answer which led to the next question.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1845,
      },
    },
  },
  {
    actionIndex: 6,
    info: {
      description:
        "Tapping on the result message to see if it provides additional options or information.",
      explanation:
        "I want to explore what happens after completing the quiz and check if there are options to retake the quiz or exit.",
      previousActionAnalysis:
        "Selected 'London' as the answer and received a congratulatory message.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1265,
      },
    },
  },
  {
    actionIndex: 7,
    info: {
      description:
        "Tapping on the congratulatory message to see if it presents options for a new quiz or results.",
      explanation:
        "I want to check if there's an option to retry the quiz or view more details.",
      previousActionAnalysis:
        "Clicked to view the congratulatory message after finishing the quiz.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 1242,
      },
    },
  },
  {
    actionIndex: 8,
    info: {
      description:
        "Checking the app's top navigation or back button to see if options to restart or go back are available after quiz completion.",
      explanation:
        "I want to explore if the app has a way to restart the quiz or see other options.",
      previousActionAnalysis:
        "Clicked the congratulatory message without any further options showing.",
    },
    action: {
      type: "tap",
      data: {
        x: 540,
        y: 100,
      },
    },
  },
  {
    reason: "Finished exploring.",
  },
];
