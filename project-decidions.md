Используемые инструменты для веб: 

| Компонент           | Инструмент                            | Назначение                    |
| ------------------- | ------------------------------------- | ----------------------------- |
| **Frontend**        | **Next.js + TypeScript**              | Web-приложение                |
| **Backend / API**   | **Next.js API**                       | REST API и серверная логика   |
| **Hosting**         | **Vercel**                            | Размещение web + backend      |
| **Scheduler**       | **Vercel Cron Jobs**                  | Запуск проверки reminders     |
| **Database**        | **Supabase PostgreSQL**               | Хранение данных               |
| **Database client** | **Supabase**                          | Работа с PostgreSQL           |
| **Web Push**        | **Web Push + VAPID**                  | Push-уведомления на iPhone    |
| **Domain / DNS**    | **Cloudflare**                        | Домен и DNS                   |
| **Timezone**        | `Asia/Almaty` на первом этапе         | Расчёт времени reminders      |
| **Configuration**   | `.env` / Vercel Environment Variables | Секреты и настройки           |
| **API protocol**    | **HTTPS / REST**                      | Связь Web ↔ Backend ↔ Desktop |
| **Desktop sync**    | HTTP polling                          | Синхронизация в Phase 2/3     |
