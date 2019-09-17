/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-26 13:43:05
 * @LastEditTime: 2019-09-17 10:19:20
 * @LastEditors: Please set LastEditors
 */
cc.Class({
    extends: cc.Component,

    properties: {
        eventMove:cc.Label,
        eventSpeed:cc.Label,
        eventAttact:cc.Label,
        eventNum:cc.Label,
        eventDirection:cc.Label,
        eventName:cc.Label,
    },

    onLoad () {
        let self = this;
        //当前军团
        self.eNode = null;
        //军团阵容节点
        self.armyNode = [];
        //军团移动状态
        self.isMove = false;
        //军团攻击状态 0->无攻击状态 1->仅弓兵作战 2->全面作战
        self.isAttact = 0;
        //军团总人数
        self.num = 0;
        //军团行军速度
        self.speed = 0;
        //军团面向 1向上 2向下 3向左 4向右
        self.direction = 1;

    },

    start () {

    },

    update (dt) {

    },

    /**
     * @description: 获取目标军团信息打印到菜单
     * @param {node} 军团的根节点 
     * @return: 无
     */    
    setLegionNode:function (node){
        let self = this;
        if (self.eNode && self.eNode.name !== node.name) self.eNode.getComponent('Legion').foucs = false;
        
        let msg = node.getComponent('Legion');
        self.isMove = msg.isMove;
        self.isAttact = msg.isAttact;
        self.num = msg.num;
        self.speed = msg.speed;
        self.direction = msg.direction;
        self.eventName.string = '军团名称：' + node.name;
        self.eventMove.string = '行动状态：' + (msg.isMove? '移动中':'待机');
        self.eventNum.string = '军团人数：' + msg.num;
        self.eventSpeed.string = '行军速度：' + msg.speed;
        self.eventAttact.string = '战略状态：' + (msg.isAttact===0? '无战斗':msg.isAttact===1? '弓兵作战':'全军作战');
        self.eventDirection.string = '行军方向：' + (msg.direction===1? '北':msg.direction===2? '南':msg.direction===3? '西':'东');
        
        if (self.eNode && self.eNode.name === node.name) return;
        self.eNode = node;
        self.armyNode = msg.armyNode;
        self.setMenu();
    },

    /**
     * @description: 根据当前的阵容节点，重新渲染阵容
     * @param {} 
     * @return: 无
     */    
    setMenu:function(){
        let self = this;
        let zx = self.node.getChildByName('menuLegion');
        zx.removeAllChildren(true);
        for(let i = 0;i<self.armyNode.length;i++){
            let aNode = cc.instantiate(self.armyNode[i]);
            // aNode.parent = zx;
            aNode.setPosition((180/(self.armyNode.length*2))*(3-2*i),0);
            aNode.height = 180;
            aNode.width = 180/self.armyNode.length;
            zx.addChild(aNode);
            aNode.on(cc.Node.EventType.TOUCH_MOVE,function(event){
                zx.insertChild(aNode, 10);
                let touches = event.getTouches();
                let touchLoc = touches[0].getLocation();
                let nodePos = zx.convertToNodeSpaceAR(touchLoc);
                let nx = nodePos.x>90? 90:nodePos.x<-90? -90:nodePos.x;
                aNode.setPosition(nx,0); 
            },aNode);
            aNode.on(cc.Node.EventType.TOUCH_END,function(event){
                self.checkPosition(aNode)
            },aNode);
            aNode.on(cc.Node.EventType.TOUCH_CANCEL,function(event){
                self.checkPosition(aNode)
            },aNode);
        }
    },

    /**
     * @description: 判断阵容节点移动的位置并调用改变函数
     * @param {aNode} 当前正在移动的阵容节点
     * @return: 
     */    
    checkPosition:function (aNode){
        let i = 0;
        for(let m = 0;m<this.armyNode.length;m++){
            if(this.armyNode[m].name === aNode.name) i = m;
        }
        let eX = aNode.x;
        let toA = 0;
        if (-90<=eX && eX<=-45){
            toA=3;
        }else if (-45<eX && eX<=0){
            toA=2;
        }else if (0<eX && eX<=45){
            toA=1;
        }else if (45<eX && eX<=90){
            toA=0;
        }
        if(i === toA) return aNode.setPosition((180/(this.armyNode.length*2))*(3-2*i),0);
        this.changeLegion(i,toA);
        return true;
    },

    /**
     * @description: 根据移动信息构建新的阵容数组并调用渲染函数
     * @param {i,j} i->当前阵容节点数组中正在移动的节点的下标 j->将要移动到阵容节点数组中的新下标
     * @return: 无
     */    
    changeLegion:function (i,j){
        let newA = [];
        newA[j] = this.armyNode[i];
        this.armyNode.splice(i,1)
        for(let m = 0;m<this.armyNode.length;m++){
            if(!newA[m]) {
                newA[m] = this.armyNode[m];
            }else{
                newA[m+1] = this.armyNode[m];
            }
        }
        this.armyNode = newA;
        this.eNode.getComponent('Legion').changeLegion(newA);
        this.setMenu();
    },
    
});
