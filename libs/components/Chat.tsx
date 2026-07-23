import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import { useLazyQuery } from '@apollo/client';
import ScrollableFeed from 'react-scrollable-feed';
import { GET_VEHICLES } from '../../apollo/user/query';
import { REACT_APP_API_URL, Messages } from '../config';
import { sweetErrorAlert } from '../sweetAlert';
import { vehicleTitle } from '../vehicle';
import { formatterStr } from '../utils';
import { Vehicle } from '../types/vehicle/vehicle';
import { VehicleBrand, VehicleFuel } from '../enums/vehicle.enum';

/** Words that carry no search value on their own — filtered out before we treat a
 *  token as a candidate model/keyword. Covers the phrasing shoppers actually type
 *  (EN + UZ), not an exhaustive stop-word list. **/
const STOPWORDS = new Set([
	'bormi',
	'bor',
	'bormidi',
	'bormikan',
	'bormikin',
	'haqida',
	'degan',
	'deb',
	'mashina',
	'mashinasi',
	'mashinalari',
	'narxi',
	'narxida',
	'narxda',
	'qancha',
	'nechada',
	'nechaga',
	'qanday',
	'qaysi',
	'uchun',
	'bilan',
	'bormi?',
	'va',
	'ha',
	'yoq',
	"yo'q",
	'iltimos',
	'malumot',
	"ma'lumot",
	'bering',
	'bera',
	'olaman',
	'olamiz',
	'tell',
	'me',
	'about',
	'is',
	'there',
	'are',
	'a',
	'an',
	'the',
	'do',
	'you',
	'have',
	'has',
	'any',
	'info',
	'information',
	'please',
	'car',
	'cars',
	'vehicle',
	'vehicles',
	'price',
	'prices',
	'cost',
	'much',
	'many',
	'hi',
	'hello',
	'hey',
	'salom',
	'assalomu',
	'alaykum',
	'rahmat',
	'thanks',
	'thank',
	'what',
	'which',
	'show',
	'find',
	'looking',
	'for',
	'want',
	'need',
	'can',
	'i',
]);

const BRAND_MAP: Record<string, VehicleBrand> = {
	hyundai: VehicleBrand.HYUNDAI,
	kia: VehicleBrand.KIA,
};

const FUEL_MAP: Record<string, VehicleFuel> = {
	gasoline: VehicleFuel.GASOLINE,
	petrol: VehicleFuel.GASOLINE,
	benzin: VehicleFuel.GASOLINE,
	diesel: VehicleFuel.DIESEL,
	dizel: VehicleFuel.DIESEL,
	hybrid: VehicleFuel.HYBRID,
	gibrid: VehicleFuel.HYBRID,
	electric: VehicleFuel.ELECTRIC,
	elektr: VehicleFuel.ELECTRIC,
	elektromobil: VehicleFuel.ELECTRIC,
	lpg: VehicleFuel.LPG,
	gaz: VehicleFuel.LPG,
};

interface ParsedQuery {
	brand?: VehicleBrand;
	fuel?: VehicleFuel;
	candidates: string[];
}

const parseAssistantQuery = (raw: string): ParsedQuery => {
	const tokens = raw
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s]/gu, ' ')
		.split(/\s+/)
		.filter(Boolean);

	// `startsWith` (not exact match) so Uzbek suffixes survive, e.g. "elektromobillar" still hits "elektromobil"
	const brandToken = tokens.find((t) => Object.keys(BRAND_MAP).some((key) => t.startsWith(key)));
	const fuelToken = tokens.find((t) => Object.keys(FUEL_MAP).some((key) => t.startsWith(key)));
	const brandKey = brandToken && Object.keys(BRAND_MAP).find((key) => brandToken.startsWith(key));
	const fuelKey = fuelToken && Object.keys(FUEL_MAP).find((key) => fuelToken.startsWith(key));

	const candidates = Array.from(
		new Set(
			tokens.filter((t) => t.length >= 3 && t !== brandToken && t !== fuelToken && !STOPWORDS.has(t)),
		),
	).sort((a, b) => b.length - a.length);

	return {
		brand: brandKey ? BRAND_MAP[brandKey] : undefined,
		fuel: fuelKey ? FUEL_MAP[fuelKey] : undefined,
		candidates,
	};
};

type BotTurnKind = 'help' | 'results' | 'empty' | 'error';

interface ChatTurn {
	_id: string;
	role: 'user' | 'bot';
	text?: string;
	kind?: BotTurnKind;
	vehicles?: Vehicle[];
	keyword?: string;
}

const HELP_TEXT =
	'Ask about a Hyundai or Kia model, price, or location. For example: "Do you have a Sonata?", "Kia electric cars", "SUVs in Seoul".';

const Chat = () => {
	const router = useRouter();
	const [conversation, setConversation] = useState<ChatTurn[]>([
		{ _id: 'welcome', role: 'bot', kind: 'help', text: `Hi! I'm the Santa assistant. ${HELP_TEXT}` },
	]);
	const [messageInput, setMessageInput] = useState<string>('');
	const [pending, setPending] = useState<boolean>(false);
	const textInput = useRef(null);
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [fetchVehicles] = useLazyQuery(GET_VEHICLES, { fetchPolicy: 'network-only' });

	/** LIFECYCLES **/

	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	React.useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = (e: any) => {
		setMessageInput(e.target.value);
	};

	const getKeyHandler = (e: any) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const searchVehicles = async (search: Record<string, any>, limit = 5): Promise<Vehicle[]> => {
		const { data } = await fetchVehicles({
			variables: { input: { page: 1, limit, sort: 'createdAt', direction: 'DESC', search } },
		});
		return data?.getVehicles?.list ?? [];
	};

	const answerQuestion = async (raw: string): Promise<ChatTurn> => {
		const { brand, fuel, candidates } = parseAssistantQuery(raw);
		const base: Record<string, any> = {};
		if (brand) base.brandList = [brand];
		if (fuel) base.fuelList = [fuel];

		if (!brand && !fuel && candidates.length === 0) {
			return { _id: `bot-${Date.now()}`, role: 'bot', kind: 'help', text: HELP_TEXT };
		}

		try {
			let results: Vehicle[] = [];
			let matchedKeyword: string | undefined;

			for (const candidate of candidates.slice(0, 2)) {
				results = await searchVehicles({ ...base, text: candidate });
				if (results.length) {
					matchedKeyword = candidate;
					break;
				}
			}

			if (!results.length && (brand || fuel)) {
				results = await searchVehicles(base);
			}

			if (results.length) {
				return { _id: `bot-${Date.now()}`, role: 'bot', kind: 'results', vehicles: results };
			}

			return {
				_id: `bot-${Date.now()}`,
				role: 'bot',
				kind: 'empty',
				keyword: matchedKeyword ?? candidates[0] ?? brand ?? fuel,
			};
		} catch (err) {
			return {
				_id: `bot-${Date.now()}`,
				role: 'bot',
				kind: 'error',
				text: "Sorry, I couldn't reach the inventory right now. Please try again shortly.",
			};
		}
	};

	const onClickHandler = async () => {
		const text = messageInput.trim();
		if (!text) {
			sweetErrorAlert(Messages.error4);
			return;
		}

		const userTurn: ChatTurn = { _id: `user-${Date.now()}`, role: 'user', text };
		setConversation((prev) => [...prev, userTurn]);
		setMessageInput('');
		setPending(true);

		const botTurn = await answerQuestion(text);
		setConversation((prev) => [...prev, botTurn]);
		setPending(false);
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>Santa Assistant</div>
				</Box>
				<Box className={'chat-content'} id="chat-content" component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							{conversation.map((turn) => {
								if (turn.role === 'user') {
									return (
										<Box
											key={turn._id}
											component={'div'}
											flexDirection={'row'}
											style={{ display: 'flex' }}
											alignItems={'flex-end'}
											justifyContent={'flex-end'}
											sx={{ m: '10px 0px' }}
										>
											<div className={'msg-right'}>{turn.text}</div>
										</Box>
									);
								}

								return (
									<Box key={turn._id} flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={'Santa'} src={'/img/logo/favicon.svg'} />
										<div className={'msg-left'}>
											{turn.kind === 'results' ? (
												<>
													<p>Here's what I found:</p>
													<div className={'assistant-results'}>
														{turn.vehicles?.map((vehicle) => (
															<Link
																key={vehicle._id}
																href={`/vehicle/detail?id=${vehicle._id}`}
																className={'assistant-result-card'}
															>
																<img
																	src={`${REACT_APP_API_URL}/${vehicle.vehicleImages?.[0]}`}
																	alt={vehicleTitle(vehicle)}
																/>
																<div>
																	<strong>{vehicleTitle(vehicle)}</strong>
																	<span>
																		${formatterStr(vehicle.vehiclePrice)} · {vehicle.vehicleLocation}
																	</span>
																</div>
															</Link>
														))}
													</div>
												</>
											) : turn.kind === 'empty' ? (
												<>
													<p>
														{turn.keyword
															? `I couldn't find a match for "${turn.keyword}" right now.`
															: "I couldn't find a match right now."}
													</p>
													<Link href={'/vehicle'}>Browse all vehicles →</Link>
												</>
											) : (
												<p>{turn.text}</p>
											)}
										</div>
									</Box>
								);
							})}
							{pending && (
								<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<Avatar alt={'Santa'} src={'/img/logo/favicon.svg'} />
									<div className={'msg-left'}>
										<p>Searching…</p>
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
