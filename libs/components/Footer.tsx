import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import Link from 'next/link';
import { VehicleBrand } from '../enums/vehicle.enum';

const vehicleSearchUrl = (search: Record<string, unknown>) =>
	`/vehicle?input=${JSON.stringify({
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: { pricesRange: { start: 0, end: 200000000 }, ...search },
	})}`;

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logo-white.svg" alt="Santa" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Santa client support</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Dealer onboarding</span>
							<p>+82 10 4867 2909</p>
							<span>Mon-Fri · Korea hours</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Follow Santa</p>
							<div className={'media-box'}>
								<Link href={'/'} aria-label={'Facebook'}>
									<FacebookOutlinedIcon />
								</Link>
								<Link href={'/'} aria-label={'Telegram'}>
									<TelegramIcon />
								</Link>
								<Link href={'/'} aria-label={'Instagram'}>
									<InstagramIcon />
								</Link>
								<Link href={'/'} aria-label={'Twitter'}>
									<TwitterIcon />
								</Link>
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Search</strong>
								<Link href={vehicleSearchUrl({ brandList: [VehicleBrand.HYUNDAI] })}>
									<span>Hyundai new cars</span>
								</Link>
								<Link href={vehicleSearchUrl({ brandList: [VehicleBrand.KIA] })}>
									<span>Kia new cars</span>
								</Link>
							</div>
							<div>
								<strong>Quick Links</strong>
								<Link href={'/cs'}>
									<span>Terms of Use</span>
								</Link>
								<Link href={'/cs'}>
									<span>Privacy Policy</span>
								</Link>
								<Link href={'/cs'}>
									<span>Pricing Plans</span>
								</Link>
								<Link href={'/cs'}>
									<span>Our Services</span>
								</Link>
								<Link href={'/cs'}>
									<span>Contact Support</span>
								</Link>
								<Link href={'/cs?tab=faq'}>
									<span>FAQs</span>
								</Link>
							</div>
							<div>
								<strong>Discover</strong>
								<Link href={vehicleSearchUrl({ locationList: ['Seoul'] })}>
									<span>Seoul</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Gyeongido'] })}>
									<span>Gyeongido</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Busan'] })}>
									<span>Busan</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Jejudo'] })}>
									<span>Jejudo</span>
								</Link>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© {moment().year()} Santa. Premium Hyundai & Kia marketplace in Korea.</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logo-white.svg" alt="Santa" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Santa client support</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Dealer onboarding</span>
							<p>+82 10 4867 2909</p>
							<span>Mon-Fri · Korea hours</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Follow Santa</p>
							<div className={'media-box'}>
								<Link href={'/'} aria-label={'Facebook'}>
									<FacebookOutlinedIcon />
								</Link>
								<Link href={'/'} aria-label={'Telegram'}>
									<TelegramIcon />
								</Link>
								<Link href={'/'} aria-label={'Instagram'}>
									<InstagramIcon />
								</Link>
								<Link href={'/'} aria-label={'Twitter'}>
									<TwitterIcon />
								</Link>
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>Stay close to the market</strong>
							<div>
								<input type="text" placeholder={'Email address'} />
								<span>Subscribe</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Search</strong>
								<Link href={vehicleSearchUrl({ brandList: [VehicleBrand.HYUNDAI] })}>
									<span>Hyundai new cars</span>
								</Link>
								<Link href={vehicleSearchUrl({ brandList: [VehicleBrand.KIA] })}>
									<span>Kia new cars</span>
								</Link>
							</div>
							<div>
								<strong>Quick Links</strong>
								<Link href={'/cs'}>
									<span>Terms of Use</span>
								</Link>
								<Link href={'/cs'}>
									<span>Privacy Policy</span>
								</Link>
								<Link href={'/cs'}>
									<span>Pricing Plans</span>
								</Link>
								<Link href={'/cs'}>
									<span>Our Services</span>
								</Link>
								<Link href={'/cs'}>
									<span>Contact Support</span>
								</Link>
								<Link href={'/cs?tab=faq'}>
									<span>FAQs</span>
								</Link>
							</div>
							<div>
								<strong>Discover</strong>
								<Link href={vehicleSearchUrl({ locationList: ['Seoul'] })}>
									<span>Seoul</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Gyeongido'] })}>
									<span>Gyeongido</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Busan'] })}>
									<span>Busan</span>
								</Link>
								<Link href={vehicleSearchUrl({ locationList: ['Jejudo'] })}>
									<span>Jejudo</span>
								</Link>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© {moment().year()} Santa. Premium Hyundai & Kia marketplace in Korea.</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
