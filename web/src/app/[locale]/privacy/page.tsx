import { title } from '@/components/primitives';
import { NOTICE_VERSION, practitioner } from '@/config/consent';

const mail = (
  <a href={`mailto:${practitioner.email}`} className='underline'>
    {practitioner.email}
  </a>
);

const Section = ({
  heading,
  children
}: {
  heading: string;
  children: React.ReactNode;
}) => (
  <section className='mt-8'>
    <h2 className='text-xl font-semibold mb-2'>{heading}</h2>
    <div className='space-y-2 text-default-700'>{children}</div>
  </section>
);

const list = 'list-disc pl-6 space-y-1';

export default function PrivacyPage() {
  return (
    <div className='max-w-3xl mx-auto'>
      <div className='text-center'>
        <h1 className={title()}>Privacy notice</h1>
        <p className='text-default-500 mt-2'>
          Notis privasi · Last updated / Dikemas kini: {NOTICE_VERSION}
        </p>
        <p className='text-default-500 mt-2'>
          <a href='#bm' className='underline'>
            Baca dalam Bahasa Malaysia
          </a>
        </p>
      </div>

      <div lang='en'>
        <Section heading='Who we are'>
          <p>
            This site is run by {practitioner.name} ({practitioner.legalName}),{' '}
            {practitioner.location}. Contact: {mail}.
          </p>
        </Section>

        <Section heading='What we collect'>
          <p>
            <strong>When you take the test</strong> we store your answers, the
            test language, the date, and how long you took. We do not ask for
            your name, and the result is identified only by a random ID.
          </p>
          <p>
            <strong>Only if you choose to leave your details</strong> on the
            results page, we also store your name, email address, the role you
            select (optional), the exact consent wording you agreed to, and the
            date. If you also tick the second box, we store which test result is
            yours.
          </p>
          <p>
            <strong>If you use the feedback form</strong> we store your name,
            email and message.
          </p>
          <p>
            Your browser keeps your in-progress answers and your last result ID
            in its own local storage, so you can resume or reopen them. This
            stays on your device. We do not use advertising or analytics
            cookies. Our hosting provider, Cloudflare, processes technical
            information such as your IP address to deliver and protect the site.
          </p>
        </Section>

        <Section heading='How we use it'>
          <ul className={list}>
            <li>To show you your results.</li>
            <li>
              To produce anonymous, aggregated statistics about test results.
            </li>
            <li>
              If you opted in: to contact you by email about coaching and
              workplace programmes.
            </li>
            <li>
              If you ticked the second box: to look at your result before a
              conversation with you.
            </li>
          </ul>
          <p>
            This test is not a clinical or diagnostic tool, and it is not
            intended for hiring or employment decisions.
          </p>
        </Section>

        <Section heading='Who sees it'>
          <p>
            <strong>
              Individual results are never shared with your employer
            </strong>{' '}
            or anyone else, and your details are never sold. The data is stored
            with Cloudflare, which may hold it on servers outside Malaysia.
          </p>
          <p>
            When you leave your details or send feedback, your name, email,
            selected role and message are sent to Elijah through Telegram as a
            notification. Telegram may process this outside Malaysia. Test
            scores are not included in these notifications.
          </p>
          <p>
            Anyone who has your result ID or link can open your result page, so
            share it only with people you choose.
          </p>
        </Section>

        <Section heading='How long we keep it'>
          <p>
            Contact details are kept for up to two years after our last contact
            with you, or until you withdraw consent, whichever comes first.
            Anonymous test results are kept until you ask us to delete them.
          </p>
        </Section>

        <Section heading='Your choices'>
          <p>
            You can ask to see, correct or delete your details, withdraw
            consent, or ask us to stop contacting you, at any time, by emailing{' '}
            {mail}. To delete a test result, include its result ID.
          </p>
        </Section>
      </div>

      <hr className='my-12 border-default-200' />

      <div lang='ms' id='bm'>
        <h2 className={title({ size: 'sm' })}>Notis privasi</h2>

        <Section heading='Siapa kami'>
          <p>
            Laman ini dikendalikan oleh {practitioner.name} (
            {practitioner.legalName}), Sibu, Sarawak, Malaysia. Hubungi: {mail}.
          </p>
        </Section>

        <Section heading='Data yang kami kumpul'>
          <p>
            <strong>Apabila anda mengambil ujian</strong>, kami menyimpan
            jawapan anda, bahasa ujian, tarikh, dan tempoh masa yang diambil.
            Kami tidak meminta nama anda, dan keputusan hanya dikenal pasti
            melalui ID rawak.
          </p>
          <p>
            <strong>Hanya jika anda memilih untuk meninggalkan butiran</strong>{' '}
            di halaman keputusan, kami juga menyimpan nama, alamat e-mel,
            peranan yang anda pilih (pilihan), kata-kata persetujuan yang tepat
            yang anda setujui, dan tarikhnya. Jika anda turut menandakan kotak
            kedua, kami menyimpan keputusan ujian yang mana milik anda.
          </p>
          <p>
            <strong>Jika anda menggunakan borang maklum balas</strong>, kami
            menyimpan nama, e-mel dan mesej anda.
          </p>
          <p>
            Pelayar anda menyimpan jawapan yang belum selesai dan ID keputusan
            terakhir anda dalam storan tempatannya sendiri supaya anda boleh
            menyambung atau membukanya semula. Data ini kekal pada peranti anda.
            Kami tidak menggunakan kuki pengiklanan atau analitik. Penyedia
            pengehosan kami, Cloudflare, memproses maklumat teknikal seperti
            alamat IP anda untuk menyampaikan dan melindungi laman ini.
          </p>
        </Section>

        <Section heading='Cara kami menggunakannya'>
          <ul className={list}>
            <li>Untuk memaparkan keputusan anda.</li>
            <li>
              Untuk menghasilkan statistik agregat tanpa nama mengenai keputusan
              ujian.
            </li>
            <li>
              Jika anda bersetuju: untuk menghubungi anda melalui e-mel mengenai
              program bimbingan (coaching) dan program tempat kerja.
            </li>
            <li>
              Jika anda menandakan kotak kedua: untuk meneliti keputusan anda
              sebelum perbualan dengan anda.
            </li>
          </ul>
          <p>
            Ujian ini bukan alat klinikal atau diagnostik, dan tidak bertujuan
            untuk keputusan pengambilan atau pekerjaan.
          </p>
        </Section>

        <Section heading='Siapa yang boleh melihatnya'>
          <p>
            <strong>
              Keputusan individu tidak sekali-kali dikongsi dengan majikan anda
            </strong>{' '}
            atau sesiapa pun, dan butiran anda tidak dijual. Data disimpan
            dengan Cloudflare, yang mungkin menyimpannya di pelayan di luar
            Malaysia.
          </p>
          <p>
            Apabila anda meninggalkan butiran atau menghantar maklum balas,
            nama, e-mel, peranan yang dipilih dan mesej anda dihantar kepada
            Elijah melalui Telegram sebagai pemberitahuan. Telegram mungkin
            memprosesnya di luar Malaysia. Skor ujian tidak disertakan dalam
            pemberitahuan ini.
          </p>
          <p>
            Sesiapa yang mempunyai ID atau pautan keputusan anda boleh membuka
            halaman keputusan anda, jadi kongsikan hanya dengan orang yang anda
            pilih.
          </p>
        </Section>

        <Section heading='Tempoh penyimpanan'>
          <p>
            Butiran hubungan disimpan sehingga dua tahun selepas hubungan
            terakhir kami dengan anda, atau sehingga anda menarik balik
            persetujuan, mengikut mana yang lebih awal. Keputusan ujian tanpa
            nama disimpan sehingga anda meminta kami memadamkannya.
          </p>
        </Section>

        <Section heading='Pilihan anda'>
          <p>
            Anda boleh meminta untuk melihat, membetulkan atau memadam butiran
            anda, menarik balik persetujuan, atau meminta kami berhenti
            menghubungi anda, pada bila-bila masa, dengan menghantar e-mel ke{' '}
            {mail}. Untuk memadam keputusan ujian, sertakan ID keputusannya.
          </p>
        </Section>
      </div>
    </div>
  );
}
