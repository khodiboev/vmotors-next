import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, 'USER');
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const submitHandler = () => {
		if (loginView) doLogin();
		else doSignUp();
	};

	const enterKeyHandler = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') submitHandler();
	};

	return (
		<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						<Stack className={'brand-panel'}>
							<div className={'brand-abstract'} aria-hidden={'true'}>
								<span className={'brand-mesh'} />
								<span className={'brand-orb orb-one'} />
								<span className={'brand-orb orb-two'} />
								<span className={'brand-streak'} />
								<span className={'brand-vignette'} />
							</div>
							<div className={'brand-top'}>
								<img src="/img/logo/logo-white.svg" alt="Santa" />
							</div>
							<div className={'brand-copy'}>
								<span className={'eyebrow'}>Premium Hyundai &amp; Kia Marketplace</span>
								<h1>Your next drive starts here.</h1>
								<p>Join Korea&apos;s trusted marketplace for brand-new Hyundai and Kia vehicles.</p>
							</div>
							<ul className={'brand-points'}>
								<li>
									<span className={'point-icon'}>
										<VerifiedOutlinedIcon />
									</span>
									<div>
										<strong>Verified listings</strong>
										<span>Every vehicle is checked before it goes live</span>
									</div>
								</li>
								<li>
									<span className={'point-icon'}>
										<QueryStatsOutlinedIcon />
									</span>
									<div>
										<strong>Smart research</strong>
										<span>Save vehicles, compare trims, and track prices</span>
									</div>
								</li>
								<li>
									<span className={'point-icon'}>
										<ForumOutlinedIcon />
									</span>
									<div>
										<strong>Direct dealer outreach</strong>
										<span>Message certified dealers without the showroom pressure</span>
									</div>
								</li>
							</ul>
							<div className={'brand-foot'}>
								<span>HYUNDAI</span>
								<i />
								<span>KIA</span>
								<em>Official new-car dealer network</em>
							</div>
						</Stack>
						<Stack className={'form-panel'}>
							<div className={'form-head'}>
								<span className={'eyebrow'}>{loginView ? 'Welcome back' : 'Get started'}</span>
								<h2>{loginView ? 'Sign in to Santa' : 'Create your account'}</h2>
								<p>
									{loginView
										? 'Pick up where you left off — saved vehicles, research, and dealer chats.'
										: 'A single account for saving vehicles, contacting dealers, and joining the community.'}
								</p>
							</div>
							<div className={'mode-switch'} role={'tablist'}>
								<span className={`switch-pill ${loginView ? '' : 'right'}`} />
								<button
									type={'button'}
									role={'tab'}
									aria-selected={loginView}
									className={loginView ? 'active' : ''}
									onClick={() => viewChangeHandler(true)}
								>
									Login
								</button>
								<button
									type={'button'}
									role={'tab'}
									aria-selected={!loginView}
									className={!loginView ? 'active' : ''}
									onClick={() => viewChangeHandler(false)}
								>
									Sign Up
								</button>
							</div>
							<div className={'input-wrap'} key={loginView ? 'login' : 'signup'}>
								<div className={'input-box'}>
									<span>Nickname</span>
									<div className={'field'}>
										<PersonOutlineIcon className={'field-icon'} />
										<input
											type="text"
											placeholder={'Enter your nickname'}
											value={input.nick}
											onChange={(e) => handleInput('nick', e.target.value)}
											required={true}
											onKeyDown={enterKeyHandler}
										/>
									</div>
								</div>
								<div className={'input-box'}>
									<span>Password</span>
									<div className={'field'}>
										<LockOutlinedIcon className={'field-icon'} />
										<input
											type={showPassword ? 'text' : 'password'}
											placeholder={'Enter your password'}
											value={input.password}
											onChange={(e) => handleInput('password', e.target.value)}
											required={true}
											onKeyDown={enterKeyHandler}
										/>
										<button
											type={'button'}
											className={'field-eye'}
											aria-label={showPassword ? 'Hide password' : 'Show password'}
											onClick={() => setShowPassword((prev) => !prev)}
										>
											{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
										</button>
									</div>
								</div>
								{!loginView && (
									<div className={'input-box'}>
										<span>Phone</span>
										<div className={'field'}>
											<LocalPhoneOutlinedIcon className={'field-icon'} />
											<input
												type="text"
												placeholder={'Enter your phone number'}
												value={input.phone}
												onChange={(e) => handleInput('phone', e.target.value)}
												required={true}
												onKeyDown={enterKeyHandler}
											/>
										</div>
									</div>
								)}
							</div>
							{loginView && (
								<div className={'remember-info'}>
									<FormGroup>
										<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
									</FormGroup>
									<a>Lost your password?</a>
								</div>
							)}
							<Button
								variant="contained"
								className={'submit-btn'}
								endIcon={<EastRoundedIcon />}
								disabled={
									loginView
										? input.nick === '' || input.password === ''
										: input.nick === '' || input.password === '' || input.phone === ''
								}
								onClick={submitHandler}
							>
								{loginView ? 'Login' : 'Create Account'}
							</Button>
							{!loginView && (
								<p className={'dealer-note'}>
									Want to sell on Santa? Dealer access is granted by our team after signup.
								</p>
							)}
							<div className={'ask-info'}>
								{loginView ? (
									<p>
										Not registered yet?
										<b onClick={() => viewChangeHandler(false)}>Sign Up</b>
									</p>
								) : (
									<p>
										Already have an account?
										<b onClick={() => viewChangeHandler(true)}>Login</b>
									</p>
								)}
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
	);
};

export default withLayoutBasic(Join);
