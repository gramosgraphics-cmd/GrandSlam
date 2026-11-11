# GrandSlam · guía de Supabase + Gemini

Escribes en el panel lo que pasa en el juego → **Gemini** lo interpreta → tú confirmas → se guarda en **Supabase** → la página de todos se actualiza sola.

## Paso a paso (una sola vez)
1. **Proyecto:** crea una cuenta y un proyecto en supabase.com (revisa los límites del plan gratis; los proyectos gratis se pausan si pasan mucho tiempo sin uso).
2. **Base de datos:** Supabase → **SQL Editor** → pega todo `supabase/setup.sql` → **Run**. Crea las tablas, las reglas de seguridad, el tiempo real y datos de demostración.
3. **Tu usuario administrador:** **Authentication → Users → Add user** (correo y contraseña, marca *Auto confirm*). Después desactiva el registro público (**Authentication → Sign In / Providers → "Allow new users to sign up" apagado**). Es importante: cualquier usuario con sesión puede escribir. Para limitarlo solo a tu correo, ejecuta en el SQL Editor:
   ```sql
   do $$ declare t text; begin
     foreach t in array array['teams','players','games','news','transactions','plays'] loop
       execute format('drop policy "escritura admin" on public.%I', t);
       execute format($f$create policy "escritura admin" on public.%I for all to authenticated
         using (auth.jwt()->>'email' = 'TU@CORREO.COM') with check (auth.jwt()->>'email' = 'TU@CORREO.COM')$f$, t);
     end loop; end $$;
   ```
4. **Conectar la página:** Supabase → **Project Settings → API** → copia *Project URL* y la clave *anon/publishable* en `config.js`. (Es pública por diseño. **Nunca** pongas ahí la `service_role` ni la de Gemini.)
5. **Clave de Gemini:** crea una en aistudio.google.com/apikey. En Supabase → **Edge Functions → Secrets** añade `GEMINI_API_KEY`. Opcional: `GEMINI_MODEL` si quieres otro modelo (por defecto `gemini-2.5-flash`; confirma en la documentación de Google cuál tiene capa gratuita hoy).
6. **Publicar la función:** **Edge Functions → Deploy a new function → Via Editor**, nombre `play`, pega `supabase/functions/play/index.ts` y **Deploy**. (Con la CLI: `supabase functions deploy play`.)
7. **Subir todo a GitHub** (incluida la carpeta `admin-standalone/`) y abre `tu-sitio/admin-standalone/`. Inicia sesión.

## Cómo se usa en el juego
Elige el juego y escribe. Gemini decide si es una **jugada** o una **situación**; ves lo que entendió, el antes y el después, y confirmas.
- *Empezar:* `Comienza el juego`
- *Situación:* `Entrada 5 baja, 1 out, corredores en primera y tercera, conteo 2-1, va 3 a 2 el local`
- *Jugada:* `Gabriel Ramos pegó un hit y llegó a primera` · `Ponche de Luis Pérez` · `Jonrón de Mateo Rivas con dos en base`
- *Terminar:* `Termina el juego`
- Si te equivocas: **Deshacer última**.

## Poner tu liga real
Los datos de `seed.sql` son de demostración. Para empezar de cero, en el SQL Editor:
```sql
truncate public.plays, public.games, public.players, public.news, public.transactions, public.teams restart identity cascade;
```
y carga tus equipos, jugadores (los nombres deben coincidir con cómo los dirás) y calendario (`games`: `round_idx` 0-9 jornadas, 10 semifinal, 11 final; `slot` 0-2). Si la base está vacía, la página muestra la demo.

## Límites a tener en cuenta
- Gemini puede equivocarse: por eso siempre confirmas antes de publicar. Los casos raros (robos, jugadas de selección) conviene registrarlos como *situación*.
- En la capa gratuita de Gemini hay límites de uso, y Google puede usar lo que envías para mejorar sus productos; aquí solo se envían nombres de jugadores y tu texto. Revisa sus condiciones vigentes.
- Con el tercer out no se cuentan las carreras de esa jugada (simplificación).
- Las estadísticas por partido (bateadores y pitchers) siguen siendo de demostración; el siguiente paso es calcularlas desde la tabla `plays`.
