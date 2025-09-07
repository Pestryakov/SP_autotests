export interface ProxyConfig {
    geo: string;
    server: string;
    login: string;
    password: string;
    localybrowser: string; // Обязательное, так как во всех объектах есть localybrowser
  }
  
  export const proxy: ProxyConfig[] = [
    { geo: 'Austria', server: '176.101.63.129:8766', login: 'user164888', password: 'f6qowk', localybrowser: "de" },
    { geo: 'Australia', server: '45.141.185.39:2597', login: 'user164888', password: 'f6qowk', localybrowser: "en-AU" },
    { geo: 'Denmark', server: '45.159.180.251:3347', login: 'user164888', password: 'f6qowk', localybrowser: "de" },
    { geo: 'NewZealand', server: '166.1.104.115:7136', login: 'user164888', password: 'f6qowk', localybrowser: "en" },
    { geo: 'Germany', server: '31.6.53.153:4474', login: 'user164888', password: 'f6qowk', localybrowser: "de" },
    { geo: 'Switzerland', server: '176.101.58.86:2365', login: 'user164888', password: 'f6qowk', localybrowser: "de" },
    { geo: 'Canada', server: '185.205.221.227:3942', login: 'user164888', password: 'f6qowk', localybrowser: "en-CA" },
    { geo: 'UnitedArabEmirates', server: '31.58.229.18:2536', login: 'user164888', password: 'f6qowk', localybrowser: "ar" },
    { geo: 'Netherlands', server: '104.165.1.199:8613', login: 'user164888', password: 'f6qowk', localybrowser: "en" },
    { geo: 'Italy', server: '181.215.227.44:3227', login: 'user164888', password: 'f6qowk', localybrowser: "it" },
    { geo: 'UnitedKingdom', server: '5.253.39.248:5128', login: 'user164888', password: 'f6qowk', localybrowser: "en" },
  ];