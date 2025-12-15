# VOICE Client Dashboard

Profesionalni dashboard za praćenje kampanja klijenata - povezan sa Airtable bazom.

## 🚀 Quick Deploy na Vercel

### Korak 1: Postavi kod na GitHub

1. Idi na [github.com](https://github.com) i napravi novi repository (npr. `voice-dashboard`)
2. Upload-uj sve fajlove iz ovog foldera

### Korak 2: Deploy na Vercel

1. Idi na [vercel.com](https://vercel.com)
2. Sign up sa GitHub nalogom
3. Klikni "New Project"
4. Izaberi tvoj `voice-dashboard` repository
5. **VAŽNO** - Dodaj Environment Variables:
   - `AIRTABLE_API_KEY` = `patuJDlX0PgddVUy5.510fe4808464d6a058f3def6922b7a91364e09d63d92b04ba999ef25b70fd3c7`
   - `AIRTABLE_BASE_ID` = `appeyjr0cdZYJ7Ta5`
6. Klikni "Deploy"

### Korak 3: Custom domen (opciono)

1. U Vercel dashboard-u idi na Settings → Domains
2. Dodaj npr. `dashboard.voiceomb.com`
3. Podesi DNS kod tvog domain providera

## 📎 Kako generisati linkove za klijente

Format linka:
```
https://tvoj-sajt.vercel.app/client/[CLIENT_RECORD_ID]
```

### Gde naći CLIENT_RECORD_ID?

1. U Airtable-u otvori tabelu **Clients**
2. Polje **Record ID** sadrži jedinstveni ID svakog klijenta
3. Ako nemaš to polje, dodaj ga:
   - Klikni "+" za novo polje
   - Izaberi "Formula"
   - Upiši: `RECORD_ID()`
   - Ime: "Record ID"

### Primer linkova:

```
https://voice-dashboard.vercel.app/client/recABC123xyz
https://voice-dashboard.vercel.app/client/recDEF456uvw
```

## 📊 Šta klijent vidi

1. **Progress bar** - trenutni views vs cilj
2. **Selektor meseca** - dropdown za prebacivanje između meseci
3. **Status** - da li je kampanja on track
4. **Metrike** - views, likes, comments, shares
5. **Lista klipova** - svi objavljeni klipovi sa linkovima

## 🔧 Potrebna polja u Airtable

### Contract Months tabela:
- Month (formula - primarno polje)
- Start Date
- End Date  
- Campaign Goal (Views)
- Total Views for a Contract Month
- %Delivered
- Number of Likes/Comments/Shares/Saves Achieved
- Days Passed Today
- Total Days in Contract Month
- %Time Passed
- Contract Status
- Record ID (from Client)

### Clips tabela:
- Influencer Name in Text
- Social (platforma)
- Social Media link
- Publish Date
- Total Views
- Likes, Comments, Share, Saves
- Status
- Contract Months (link)

## 🔒 Sigurnost

- API key je siguran na server-side (nije vidljiv klijentima)
- Svaki klijent može videti SAMO svoje podatke
- Linkovi su teški za pogoditi (random Airtable ID-jevi)

## 📞 Support

Za pitanja kontaktirajte VOICE tim.
