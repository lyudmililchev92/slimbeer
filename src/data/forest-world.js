/* Всяко ниво има свой сезон. Само цветове и дребни детайли, но гората
   изглежда различна и детето усеща, че напредва някъде. */
const FOREST_THEMES = {
  day:    { sky1:"#CFE8FF", sky2:"#EAF6E9", h1:"#CDE8D2", h2:"#A9D9B5",
            gr:"#7FB069", grass:"#6BA057", t1:"#8FD3A5", t2:"#A6DDB6",
            trunk:"#8C6A4F", sun:"rgba(255,214,102,.85)", air:"🦋", stars:false },
  meadow: { sky1:"#DCF0FF", sky2:"#F6FCEA", h1:"#DCEFC0", h2:"#C2E39E",
            gr:"#8FC46A", grass:"#7AB157", t1:"#9FD98A", t2:"#B7E5A2",
            trunk:"#96724F", sun:"rgba(255,232,150,.9)", air:"🐝", stars:false },
  autumn: { sky1:"#FFE0BE", sky2:"#FFF4E4", h1:"#F0D3A8", h2:"#E4BF8E",
            gr:"#C98A4B", grass:"#B0763C", t1:"#E8A33D", t2:"#F2C14E",
            trunk:"#7A5230", sun:"rgba(255,178,80,.9)", air:"🍂", stars:false },
  night:  { sky1:"#2B2B57", sky2:"#4C4C7E", h1:"#3A3A68", h2:"#4A4A7C",
            gr:"#3F5C47", grass:"#345040", t1:"#3E6E52", t2:"#4C8062",
            trunk:"#4A3A2E", sun:"rgba(235,240,255,.92)", air:"✨", stars:true },
  dusk:   { sky1:"#FFBE9C", sky2:"#FFE4D6", h1:"#EFC0B4", h2:"#DBA79C",
            gr:"#8E6B5C", grass:"#7A5A4C", t1:"#9C5F58", t2:"#B87A6C",
            trunk:"#5A3A2E", sun:"rgba(255,132,80,.95)", air:"🦋", stars:false },
  winter: { sky1:"#CFE6F8", sky2:"#F4FBFF", h1:"#E6F2FB", h2:"#CFE3F1",
            gr:"#F0F7FC", grass:"#B7D6EC", t1:"#4E8A6A", t2:"#6BA585",
            trunk:"#6B5344", sun:"rgba(255,250,230,.9)", air:"❄️",
            stars:false, snow:true },
  blossom:{ sky1:"#BFE6F5", sky2:"#F0FBFF", h1:"#CDEBC8", h2:"#B4DFB0",
            gr:"#8CC98A", grass:"#6FB472", t1:"#F2A6C4", t2:"#FFC2D8",
            trunk:"#7A5642", sun:"rgba(255,246,200,.95)", air:"🌸", stars:false },
  beach:  { sky1:"#7FD4EC", sky2:"#D8F5FB", h1:"#F2E0B8", h2:"#E6CE9C",
            gr:"#F0DFB4", grass:"#D9C48E", t1:"#4FA36F", t2:"#6FBE88",
            trunk:"#9C7248", sun:"rgba(255,240,160,.95)", air:"🐚",
            stars:false, palm:true },
  cave:   { sky1:"#1E1A2E", sky2:"#3A3050", h1:"#2A2440", h2:"#37304F",
            gr:"#453A5C", grass:"#5A4A74", t1:"#4E4270", t2:"#5E5085",
            trunk:"#3A3152", sun:"rgba(180,220,255,.35)", air:"✨",
            stars:false, rock:true }
};

/* Приятелите и поръчките им живеят в forest-friends.js. */

/* Колко различни места има гората — ползва се от колекцията. */
const FOREST_BIOME_COUNT = Object.keys(FOREST_THEMES).length;
