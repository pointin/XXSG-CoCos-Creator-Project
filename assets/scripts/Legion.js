/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-23 14:20:51
 * @LastEditTime: 2019-09-17 10:29:12
 * @LastEditors: Please set LastEditors
 */
cc.Class({
    extends: cc.Component,

    properties: {
        moveLabel:cc.Label,
        numLabel:cc.Label,
        lineNode:cc.Node
    },

    onLoad () {
        let self = this;
        let data = [{name:"枪兵",num:100},{name:"步兵",num:100},{name:"骑兵",num:100},{name:"弓兵",num:100}];
        
        self.createArmy(data);
        self.initialization();

        //点击、移动事件注册
        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.foucs = true;
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            let touches = event.getTouches();
            let touchLoc = touches[0].getLocation();
            let nodePos = self.node.convertToWorldSpaceAR(cc.v2(0, 0));
            let ctx = self.lineNode.getComponent(cc.Graphics);
            ctx.clear();
            ctx.moveTo(nodePos.x,nodePos.y);
            ctx.lineTo(touchLoc.x,touchLoc.y);
            ctx.stroke();
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.touchEnd(event);
        }, self.node);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL,function (event){
            self.touchEnd(event);
        }, self.node);

        //碰撞开启
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
    },

    start () {
        this.numLabel.string = this.num;
    },

    update (dt) {
        switch (this.direction){
            case 1:
                this.numLabel.string = '北';
                break;
            case 2:
                this.numLabel.string = '南';
                break;
            case 3:
                this.numLabel.string = '西';
                break;
            case 4:
                this.numLabel.string = '东';
                break;
        }
        if (this.foucs) this.node.parent.getChildByName('menu').getComponent('Menu').setLegionNode(this.node); 
    },

    /**
     * @description: 军团信息初始化
     * @param {} 
     * @return: 无
     */    
    initialization:function (){
        //军团移动状态
        this.isMove = false;
        //军团攻击状态 0->无攻击状态 1->仅弓兵作战 2->全面作战
        this.isAttact = 0;
        //保存军团在地图上的当前位置
        this.moveToPos = cc.v2(0, 0);
        //军团总人数
        this.num = 0;
        //军团行军速度
        this.speed = 0;
        //军团面向 1向北 2向南 3向西 4向东
        this.direction = 1;
        //选中状态
        this.foucs = false;

        for(let i = 0;i<this.armyNode.length;i++){
            let army = this.armyNode[i].getComponent("Army");
            this.num+=army.num;
            if (this.speed === 0){
                this.speed = army.speed;
            }else if(this.speed>army.speed){
                this.speed = army.speed;
            }
        }
    },

    /**
     * @description: 生成军团的部队结构
     * @param {msg} 生成军团的信息 [{name:"枪兵",num:100},{name:"步兵",num:100},{name:"骑兵",num:100},{name:"弓兵",num:100}]
     * @return: 无
     */    
    createArmy:function (msg){
        let aNode = this.node.getChildByName('army');
        this.armyNode = [];
        for(let i = 0;i<msg.length;i++){
            //上次写到这！！！！！！！
            //接受军团信息，生成军团下army节点内的军队节点，并赋值给this.armyNode,然后渲染每个军队
            //然后写军团内阵容变化的动画。。。。。就是changeLegion函数
            let selfNode = new cc.Node(msg[i].name);
            let nodeNum = new cc.Node('numLabel');
            let nodeType = new cc.Node('typeLabel');
            selfNode.parent = aNode;
            nodeNum.parent = selfNode;
            nodeType.parent = selfNode;
            let a = selfNode.addComponent('Army');
            let aMsg = {};
            if(msg[i].name==='枪兵'){
                aMsg = Infantry;
            }else if(msg[i].name==='步兵'){
                aMsg = Spearman;
            }else if(msg[i].name==='骑兵'){
                aMsg = Cavalry;
            }else if(msg[i].name==='弓兵'){
                aMsg = Bowmen;
            }
            a.type=msg[i].name;
            a.num=msg[i].num;
            a.speed=aMsg.speed;
            a.demage=aMsg.demage;
            a.numLabel = nodeNum;
            a.typeLabel = nodeType;
            selfNode.color=aMsg.color;
            selfNode.setPosition((100/(msg.length*2))*(3-2*i),0);
            selfNode.height=100;
            selfNode.width=100/msg.length;
            this.armyNode.push(selfNode);
            cc.log(selfNode)
        }
        
        // cc.log(aNode);
        // cc.log(this.armyNode);
    },

    /**
     * @description: 滑动的结束的回调函数，执行移动操作
     * @param {event} 当前滑动的对象节点
     * @return: 无
     */    
    touchEnd:function (event){
        let self = this;
        let touches = event.getTouches();
        let touchLoc = touches[0].getLocation();
        let ctx = self.lineNode.getComponent(cc.Graphics);
        ctx.clear();
        self.setDirection(self.node.position,self.node.parent.convertToNodeSpaceAR(touchLoc))
        self.isMove = true;
        self.moveLabel.string = '正在移动';
        if (self.isAttact) self.moveLabel.string = '脱离战斗';
        self.moveAct(self.node.parent.convertToNodeSpaceAR(touchLoc))
    },

    /**
     * @description: 移动动画
     * @param {d} 目标位置
     * @return: 无
     */    
    moveAct:function (d) {
        let self = this;
        self.node.stopAllActions();
        let oldPos = self.node.position;
        //向量减法，返回长度
        let direction = d.sub(oldPos).mag();
        let act = cc.moveTo(direction/self.speed,d)
        let seq = cc.sequence(act,cc.callFunc(function (){
            self.isMove = false;
            if (self.isAttact === 0) self.moveLabel.string = '待机';
            if (self.isAttact === 1) self.moveLabel.string = '弓兵作战';
            if (self.isAttact === 2) self.moveLabel.string = '全面作战';
        }))
        self.node.runAction(seq)
    },

    /**
     * @description: 改变某个兵种的战斗状态，(false)->脱离战斗 (false,object)->待机/已经脱离 (true,object)->全面战斗 (true,object,'弓兵')->弓兵战斗
     * @param {isAttact,enemy,type} 攻击状态(boolean)，敌人对象，控制兵种(弓兵、空值代表所有兵种)
     * @return: 无
     */
    stateChange:function (isAttact,enemy,type){
        if(isAttact === undefined) return;
        let isEnemy = enemy? enemy:false;
        let isType = type? type:false;
        for(let i = 0;i<this.armyNode.length;i++){
            let army = this.armyNode[i].getComponent("Army");
            if (!isAttact && !isEnemy && !isType) {
                army.isAttact = isAttact;
                this.isAttact = 0;
                this.moveLabel.string = '脱离战斗';
            }else if (!isAttact && isEnemy && !isType){
                army.isAttact = isAttact;
                this.isAttact = 0;
                this.moveLabel.string = this.node.getNumberOfRunningActions()? '已经脱离':'待机';
            }else if (isAttact && isEnemy && !isType){
                this.node.stopAllActions();
                this.isMove = false;
                army.isAttact = isAttact;
                army.enemy = isEnemy;
                this.isAttact = 2;
                this.moveLabel.string = '全面战斗';
            }else if(isAttact && isEnemy && isType === '弓兵' && army.type === isType){
                army.isAttact = isAttact;
                army.enemy = isEnemy;
                this.isAttact = 1;
                this.moveLabel.string = '弓兵战斗';
                return
            }
        } 
    },

    /**
     * @description: 判断滑动方向
     * @param {oldD,newD} 原坐标，新坐标
     * @return: 1向北 2向南 3向西 4向东 0未滑动
     */    
    setDirection:function (oldD,newD) {
        let x = newD.x-oldD.x;
        let y = newD.y-oldD.y;
        if (Math.abs(x) === 0 && Math.abs(y) === 0) return;
        let angle = Math.atan2(y, x) * 180 / Math.PI;
        if (angle > 45 && angle < 135) {
            this.direction = 1;
        } else if (angle >= -135 && angle <= -45) {
            this.direction = 2;
        } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
            this.direction = 3;
        } else if (angle >= -45 && angle <= 45) {
            this.direction = 4;
        }
    },

    /**
     * @description: 系统碰撞产生的回调，这里视为战斗开始
     * @param {other, self} other->被碰撞的对象 self->当前碰撞对象
     * @return: 无
     */    
    onCollisionEnter: function (other, self) {
        if (self.tag === 1 && other.tag === 0){
            // cc.log('当前碰撞仅弓兵可作战')
            this.stateChange(true,other.node,'弓兵')
        } else if (self.tag === 0 && other.tag === 0){
            // cc.log('当前碰撞全面作战')
            this.stateChange(true,other.node)
        }
    },

    /**
     * @description: 系统碰撞产生的回调，这里视为战斗中
     * @param {other, self} other->被碰撞的对象 self->当前碰撞对象
     * @return: 无
     */   
    onCollisionStay: function (other, self) {

    },

    /**
     * @description: 系统碰撞产生的回调，这里视为战斗结束
     * @param {other, self} other->被碰撞的对象 self->当前碰撞对象
     * @return: 无
     */   
    onCollisionExit: function (other, self) {
        if (self.tag === 1 && other.tag === 0){
            // cc.log('全面脱离作战')
            this.stateChange(false,other.node)
        } else if (self.tag === 0 && other.tag === 0){
            // cc.log('弓兵持续作战');
            if (!self.node.getNumberOfRunningActions()) {
                this.stateChange(true,other.node,'弓兵')
            }else{
                this.stateChange(false)
            }
        }
    },

    /**
     * @description: 改变阵容，军团内部开始移动
     * @param {newL} 新的阵容节点数组
     * @return: 无
     */    
    changeLegion:function (newL){
        let self = this;
        // let zx = self.node.getChildByName('army');
        // zx.removeAllChildren(true);
        cc.log(newL)
        let newArmy = [];
        for(let i = 0;i<newL.length;i++){
            
            let aNode = newL[i];
            let oldNode = null;
            cc.log(aNode)
            for(let j = 0;j<self.armyNode.length;j++){
                if(aNode.name === self.armyNode[j].name) {
                    oldNode = self.armyNode[j];
                    newArmy[i] = self.armyNode[j];
                    break;
                }
            }
            // cc.log(oldNode)
            // let oldPosition = oldNode.getPosition();
            oldNode.getComponent('Army').movePosition(cc.v2((100/(newL.length*2))*(3-2*i),0));
            newArmy[i].setPosition((100/(newL.length*2))*(3-2*i),0);
            // aNode.height = 100;
            // aNode.width = 100/newL.length;
            // zx.addChild(aNode);
            
            if((i+1) === newL.length) setTimeout(()=>{self.armyNode = newArmy;cc.log('数组变更!');cc.log(newArmy)},1);
        }
    },
});
