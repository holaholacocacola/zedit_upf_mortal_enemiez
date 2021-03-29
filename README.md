<!--- -*- mode: markdown -*- -->
# zedit_upf_mortal_enemiez
=============================
#### Zedit patcher for mortal enemies
This is the same patcher I uploaded to [nexus](https://www.nexusmods.com/skyrimspecialedition/mods/37986) sometime ago but is now archived here. This and the [synthesis](https://github.com/Synthesis-Collective/MortalEnemies-Patcher) will always have the latest update and may not match whats hosted on nexus. 

Requirements:
------------
[zedit](https://github.com/z-edit/zedit/releases)

### Settings
##### Settings can be configured by clicking the settings tab in zedit

- No commitment - 'bool': Do not apply npc attack commitment(This will only patch creatures)
- Rival Remix   - 'bool': Apply rival remix attack commitment changes
- Original      - 'bool': Apply original npc attack commitment changes


### Customization
You can override move_types.json with your own personal movement tweaks if you'd like to merge multiple move type mods. If you do this, make sure to select 'Original' attack commitment
as rival remix hardcodes certain fields in the patcher.
