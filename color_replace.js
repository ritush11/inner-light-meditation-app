const fs = require('fs');
const path = require('path');
const r = {
  "['#8B7FD9', '#A89FE0']": "['#1A826B', '#2BB092']",
  "['#4ECDC4', '#45B7AA']": "['#2A9D8F', '#21867A']",
  "['#FFB6C1', '#FF9AB5']": "['#457B9D', '#1D3557']",
  "['#FFD700', '#FFC700']": "['#E9C46A', '#F4A261']",
  "['#FFE5E5', '#FFF0F0']": "['#F0FDF4', '#DCFCE7']",
  "['#E5F5F5', '#F0FAFA']": "['#F0FDF4', '#DCFCE7']",
  "['#FFF5E5', '#FFFAF0']": "['#FFFBEB', '#FEF3C7']",
  "['#8B7FD9', '#6B5FB8']": "['#1C2B2D', '#116A55']",
  "['#FF6B9D', '#FF5E8A']": "['#264653', '#2A9D8F']",
  "['#95E1D3', '#7FD8C9']": "['#2BB092', '#82D1C1']",
  "['#667eea', '#764ba2']": "['#1D3557', '#457B9D']",
  "['#11998e', '#38ef7d']": "['#116A55', '#2BB092']",
  "['#FF6B9D', '#C449C0']": "['#E76F51', '#F4A261']",
  "color=\"#8B7FD9\"": "color={colors.primary}",
  "color=\"#4ECDC4\"": "color={colors.primaryLight}",
  "color=\"#FFB6C1\"": "color={colors.accent}",
  "color=\"#FFD700\"": "color={colors.warning}",
  "'#8B7FD9'": "colors.primary",
  "'#4ECDC4'": "colors.primaryLight",
  "'#FFB6C1'": "colors.accent",
  "'#FFD700'": "colors.warning",
  "'#FAFBFC'": "colors.background",
  "'#F5F7FA'": "colors.background",
  "true: '#4ECDC4'": "true: colors.primary",
  "thumbColor=\"#4ECDC4\"": "thumbColor={colors.primary}",
  "true: '#FFD700'": "true: colors.warning",
  "thumbColor=\"#FFD700\"": "thumbColor={colors.warning}"
};
function w(d) {
  let f=[];
  try{
    const l=fs.readdirSync(d);
    for(let e of l){
      e=path.resolve(d,e);
      const s=fs.statSync(e);
      if(s&&s.isDirectory()){
        f=f.concat(w(e));
      }else if(e.match(/\.js$/)){
        f.push(e);
      }
    }
  }catch(err){}
  return f;
}
const f = w('c:\\Users\\acer\\OneDrive\\Desktop\\inner-light\\screens').concat(w('c:\\Users\\acer\\OneDrive\\Desktop\\inner-light\\components'));
for(const i of f){
  let c=fs.readFileSync(i,'utf8'), o=c;
  for(const [k,v] of Object.entries(r)){
    c=c.split(k).join(v);
  }
  if(c!==o){
    fs.writeFileSync(i,c,'utf8');
    console.log('Updated '+i);
  }
}
