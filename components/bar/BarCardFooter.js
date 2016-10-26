// import React, { Component } from 'react';
// import { observer } from 'mobx-react/native'
//
// @observer
// export class BarCardFooter extends Component {
//     /* properties:
//         bar: schema.Bar
//         showDistance: Bool
//         showTimeInfo: Bool
//         showBarName: Bool
//         showMapButton: Bool
//     */
//
//     static defaultProps = {
//         showDistance: false,
//         showTimeInfo: true,
//         showBarName: true,
//         showMapButton: true,
//     }
//
//     handleFocusBarOnMap = () => {
//         // Update currently selected bar on map
//     }
//
//     render = () => {
//         const bar = this.props.bar
//         return <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
//             <View style={{flex : 1, marginLeft: 5, flexWrap: 'wrap'}}>
//                 <View style={{flexDirection: 'row'}}>
//                     {this.props.showTimeInfo && <TimeInfo bar={bar} />}
//                     {this.props.showDistance && <Distance bar={bar} />}
//                 </View>
//                 {this.props.showBarName && <BarName barName={bar.name} />}
//             </View>
//             {
//                 this.props.showMapButton &&
//                     <View style={{justifyContent: 'flex-end', marginRight: 5}}>
//                           <PlaceInfo bar={bar} />
//                     </View>
//             }
//         </View>
//     }
// }