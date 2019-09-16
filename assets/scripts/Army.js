/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-22 14:11:14
 * @LastEditTime: 2019-08-28 17:12:08
 * @LastEditors: Please set LastEditors
 */

cc.Class({
    extends: cc.Component,

    properties: {
        type:'',
        num:0,
        speed:1,
        demage:0.2,
        numLabel:cc.Label,
        typeLabel:cc.Label,
    },

    onLoad () {
        this.initialization = false;
        
    },

    start () {
        this.numLabel.string = this.num;
        this.typeLabel.string = this.type;
    },

    update (dt) {
        if (this.isAttact && this.enemy){
            this.timer++;
            if(this.timer===60){
                // let e = this.enemy.getComponent('Army');
                // e.num-=parseInt(this.demage*this.num);
                // if(e.num<=0) {
                //     this.enemy.destroy();
                //     this.isAttact = false;
                //     return;
                // }
                // e.numLabel.string = e.num;
                // cc.log(this.type+'正在作战！')
                this.timer = 0;
            }
        }
    },

    /**
     * @description: 生成军队
     * @param {msg} 军队信息 {name:"步兵",num:100}
     * @return: 当前节点
     */    
    createNode:function (msg){
        this.type = msg.name;
        this.num = msg.num;
        this.isAttact = false;
        this.enemy = null;
        this.timer = 0;
        this.initialization = true;
    },

    /**
     * @description: 
     * @param {type} 
     * @return: 
     */    
    movePosition:function (pos) {
        let self = this;
        let t = Math.abs(self.x-pos.x)/25;
        let moveP = cc.moveTo(t,pos);
        let suq = cc.sequence(moveP,cc.callFunc(function(){
            cc.log(self.type+'移动完成')
        }))
        self.node.runAction(suq);
    }

});
