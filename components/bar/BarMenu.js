// import {
//     React,
//     Component,
//     Image,
//     View,
//     TouchableOpacity,
//     Dimensions,
//     PureComponent,
// } from '../Component.js'
// import LinearGradient from 'react-native-linear-gradient'
// import { observer } from 'mobx-react/native'
//
// import { T } from '../AppText.js'
// import { store, favStore, tabStore, tagStore, segment } from '~/model/store.js'
// import { analytics } from '~/model/analytics.js'
// import { log } from '~/utils/curry.js'
//
// import type { String, URL } from '../Types.js'
//
// export type Category = {
//     title:  String,
//     url:    URL,
// }
//
// const menuPadding = 5
//
// @observer export class BarMenu extends PureComponent {
//     /* properties:
//         menu: Menu
//     */
//
//     render = () => {
//         const menu = this.props.menu
//         const rows =
//             [ [ { name: "Beer", tag: '#beer', submenu: menu.beer }
//               , { name: "Wine", tag: "#wine", submenu: menu.wine }
//               ]
//             , [ { name: "Spirits", tag: '#spirit', submenu: menu.spirits }
//               , { name: "Cocktails", tag: '#cocktail', submenu: menu.cocktails }
//               ]
//             , [ { name: "Water", tag: '#water', submenu: menu.water }
//               , { name: "Snacks", tag: '#snack', submenu: menu.snacks }
//               ]
//             //   , { name: "Food", tag: '#food', submenu: menu.food }
//             //   ]
//             ]
//         return <View
//                 style={
//                     { justifyContent: 'center'
//                     , alignItems: 'center'
//                     , marginLeft: menuPadding
//                     , marginRight: menuPadding
//                     }}
//                 >
//             { rows.map(this.renderRow) }
//         </View>
//     }
//
//     renderRow = (row, i) => {
//         const { width } = Dimensions.get('window')
//         return <CardRow key={i} row={row} rowWidth={width - menuPadding * 2} />
//     }
//
// }
//
// @observer class CardRow extends Component {
//     /* properties:
//         row: [{name: str, tag: str, submenu: SubMenu}]
//             list of submenus to show in a row
//         rowWidth: int
//     */
//     render = () => {
//         return <View style={
//                 { flexDirection: 'row'
//                 , justifyContent: 'space-around'
//                 }
//             }>
//             {this.props.row.map(this.renderSubMenu)}
//         </View>
//     }
//
//     renderSubMenu = (item, i) => {
//         const n = this.props.row.length
//         const margin = 5
//         const cardSpace = this.props.rowWidth - 4 * margin
//         const cardWidth =  cardSpace / 2
//         // Sanity check
//         if (!cardWidth) {
//             throw Error(this.props.rowWidth)
//         }
//         return <Card
//                     key={i}
//                     name={item.name}
//                     tag={item.tag}
//                     submenu={item.submenu}
//                     style={
//                         { margin: margin
//                         , width:  cardWidth
//                         , height: cardWidth
//                         }
//                     }
//                     />
//     }
// }
//
// @observer class Card extends Component {
//     /* properties:
//         name: str
//             e.g. "Beer", "Wine"
//         tag: str
//             e.g. "#beer", "#wine" etc
//         submenu: SubMenu
//         style: style object
//     */
//     render = () => {
//         const submenu = this.props.submenu
//         const radius = 20
//         const style = {borderRadius: radius, ...this.props.style}
//
//         // log("LOADING IMAGE", submenu.image)
//
//         return <TouchableOpacity onPress={this.handleCardPress}>
//             <Image source={{uri: submenu.image}} style={style}>
//                 {/* Push footer to bottom */}
//                 <View style={{flex: 1, borderRadius: radius}} />
//                 <LinearGradient
//                         style={{flex: 1, borderRadius: radius}}
//                         colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}
//                         >
//                     <View style={
//                             { flex: 1
//                             , justifyContent: 'flex-end'
//                             , alignItems: 'center'
//                             , borderRadius: radius
//                             , backgroundColor: 'rgba(0,0,0,0)'
//                             }
//                         }>
//                         <T style={
//                                 { fontSize: 20
//                                 , color: 'rgba(255, 255, 255, 95)'
//                                 , marginBottom: 5
//                                 }}>
//                             {this.props.name}
//                         </T>
//                     </View>
//                 </LinearGradient>
//             </Image>
//         </TouchableOpacity>
//     }
//
//     handleCardPress = () => {
//         analytics.trackMenuCardClick(this.props.tag)
//         tabStore.setCurrentTab(2)
//         tagStore.pushTag(this.props.tag)
//     }
//
// }
