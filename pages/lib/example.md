---
title: The Misty Forest
scope:
  name: Traveler
  flags: {}
---

# The Misty Forest {#story}

<script>
export default {
  data() {
    // Child sections can read these variables through the scope chain
    return { gold: 10 };
  },
};
</script>

A wall of mist rises where the road ends. Somewhere beyond it lies the heart of the forest.

{{#nav "story.camp"}}Begin the story{{/nav}}

## The Camp {#camp}

<script>
export default {
  onEnter({ scope }) {
    // Writes to flags in the root scope, persisting across sections
    scope.flags.visitedCamp = true;
  },
};
</script>

Night falls. You light a campfire and give your name:

{{input "string" name="Traveler"}}

{{#nav "story.forest"}}Step into the forest{{/nav}}

## The Forest {#forest}

<script>
export default {
  data({ scope }) {
    // Values returned by data() always merge into this section's own scope
    return {
      greeting: scope.gold >= 10 ? "You look well prepared." : "You'd better head back and rest.",
    };
  },
  onLeave({ scope, target }) {
    // Settle state based on where the reader is heading
    scope.flags.lastPath = target;
  },
};
</script>

Hello, {{name}}! {{greeting}}

{{#if flags.blessed}}
The shrine's glow still lingers around you.
{{else}}
Deep in the mist, a shrine is faintly visible.
{{/if}}

{{#nav "story.shrine"}}Approach the shrine{{/nav}}
{{#nav "story.camp"}}Return to the camp{{/nav}}

## The Shrine {#shrine}

<script>
export default {
  data({ scope }) {
    // This section's local scope resets on every entry; data() runs before onEnter()
    return { returning: scope.flags.blessed === true };
  },
  onEnter({ scope }) {
    scope.flags.blessed = true;
  },
};
</script>

{{#if returning}}
You have already received the shrine's blessing, and its warmth still surrounds you.
{{else}}
You lay a hand on the cold stone shrine, and a warm current flows into your body.
{{/if}}

{{linebreak 1}}

{{#nav "story.forest"}}Back to the forest{{/nav}}
{{#nav null}}End the story{{/nav}}
