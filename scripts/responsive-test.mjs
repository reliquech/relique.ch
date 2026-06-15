import fs from "fs";
import path from "path";

const targets = [
  {
    file: "src/app/(home)/components/MarketplaceSection.tsx",
    assertions: [
      {
        pattern: /container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl/i,
        message: "MarketplaceSection must wrap content in a shared container: container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
      },
    ],
  },
  {
    file: "src/app/(home)/components/marketplace/MarketplaceSectionHeader.tsx",
    assertions: [
      {
        pattern: /container mx-auto px-4 sm:px-6/i,
        not: true,
        message: "MarketplaceSectionHeader must not define its own container wrapper classes.",
      },
      {
        pattern: /itemsCount/i,
        message: "MarketplaceSectionHeader must accept itemsCount prop.",
      },
    ],
  },
  {
    file: "src/components/primitives/ScrollProgressBar.tsx",
    assertions: [
      {
        pattern: /container mx-auto px-6/i,
        not: true,
        message: "ScrollProgressBar must not define its own container wrapper classes.",
      },
    ],
  },
  {
    file: "src/components/primitives/DraggableCarousel.tsx",
    assertions: [
      {
        pattern: /px-\[calc\(\(100vw-1280px\)\/2\)\]/i,
        not: true,
        message: "DraggableCarousel must not use the viewport-based padding offset hack.",
      },
      {
        pattern: /px-6/i,
        not: true,
        message: "DraggableCarousel must not use hardcoded horizontal padding.",
      },
    ],
  },
  {
    file: "src/app/(home)/components/marketplace/MarketplaceCarousel.tsx",
    assertions: [
      {
        pattern: /md:w-\[calc\(\(100%-32px\)\/2\)\]/i,
        message: "MarketplaceCarousel must define responsive 2-column tablet width.",
      },
      {
        pattern: /lg:w-\[calc\(\(100%-64px\)\/3\)\]/i,
        message: "MarketplaceCarousel must define responsive 3-column desktop width.",
      },
      {
        pattern: /xl:w-\[calc\(\(100%-96px\)\/4\)\]/i,
        message: "MarketplaceCarousel must define responsive 4-column large desktop width.",
      },
    ],
  },
  {
    file: "src/lib/hooks/useDragCarousel.ts",
    assertions: [
      {
        pattern: /ResizeObserver/i,
        message: "useDragCarousel must use ResizeObserver to compute constraints dynamically.",
      },
      {
        pattern: /window\.innerWidth > 768/i,
        not: true,
        message: "useDragCarousel must not use hardcoded screen size conditions.",
      },
      {
        pattern: /1280px|1280/i,
        not: true,
        message: "useDragCarousel must not use hardcoded desktop coordinates.",
      },
    ],
  },
];

let failed = false;

for (const target of targets) {
  const filePath = path.resolve(process.cwd(), target.file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${target.file}`);
    failed = true;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  for (const assertion of target.assertions) {
    const matched = assertion.pattern.test(content);
    const pass = assertion.not ? !matched : matched;

    if (!pass) {
      console.error(`❌ Assertion failed in ${target.file}: ${assertion.message}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\n❌ Responsive layout checks failed.");
  process.exit(1);
} else {
  console.log("✅ All responsive layout checks passed successfully!");
  process.exit(0);
}
