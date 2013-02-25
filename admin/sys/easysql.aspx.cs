using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

//引用
using System.Text;
using System.Data.SqlClient;
using System.Collections.Generic;
using daDB;

public partial class admin_sys_sqlmanage_easysql : System.Web.UI.Page
{
    private DBHelper_SQL _dbhelper;         //数据库操作对象
    private string _sqlname;                //参数变量
    private string _opt;

    /*参数说明
     * db:          webconfig数据库连接配置名
     * sqlname:     数据库表名、自定义sql代码名、存储过程名等
     * opt:         操作类型，如query/insert/update/delete等
     * 
     * top:         query操作时只取前几条记录
     * field:       query操作时只需要提取的部分字段（,分隔）
     * group:       query操作时sql需要分组的group by参数（,分隔）
     * order:       query操作时sql需要排序的order by参数（,分隔）
     * 
     * qry:         query分页数据时，是否需要统计总记录数(1 == qry时需要统计)
     * pagesize:    query分页数据时，每页记录数
     * pageindex:   query分页数据时，第几页（从1开始）
     * 
     * getds:       insert/update 等操作后还需要返回数据集
     * pk*:         有pk*做前缀的参数，是针对update/delete等操作时，非主键做条件筛选，该参数字段做为筛选条件
     */
    protected void Page_Load(object sender, EventArgs e)
    {
        //Response.ContentEncoding = System.Text.Encoding.Unicode;          //设置返回内容的编码格式
        if (null != Request["db"])
        {
            _dbhelper = new DBHelper_SQL(Request["db"].ToString());
        }
        else
        {
            _dbhelper = new DBHelper_SQL();
        }

        access();


        //Response.Write(Functions.getPKey("pub_tree"));
    }

    /// <summary>
    /// 入口分配
    /// </summary>
    private void access()
    {
        if (null == Request["sqlname"])              //(1)数据库表名。(2)自定义sql代码名称。
        {
            Response.Write("error:没有提交sqlname参数");
            Response.End();
        }
        else
        {
            _sqlname = Request["sqlname"].ToString().ToLower();
        }

        if (null != Request["opt"])                 //操作类型
        {
            _opt = Request["opt"].ToString().ToLower();
        }


        _dbhelper.OpenDB();
        DataSet ds = _dbhelper.getDBObject(_sqlname);             //查找是否有sqlname参数指向的数据库对象
        _dbhelper.CloseDB();

        if (null == ds)
        {
            Response.Write("error:" + _dbhelper._sError);
            Response.End();
        }

        switch (_opt)
        {
            case "pk":      //获得一个最新流水号
                {
                    _dbhelper.OpenDB();
                    Response.Write(_dbhelper.getNewPK(_sqlname));
                    _dbhelper.CloseDB();
                    Response.End();
                    break;
                }
            case "query":   //查询数据
                {
                    query(ds);
                    break;
                }
            case "insert":  //新增数据
                {
                    insert(ds);
                    break;
                }
            case "delete":  //删除数据
                {
                    delete(ds);
                    break;
                }
            case "update":  //修改数据
                {
                    update(ds);
                    break;
                }
        }

    }


    /// <summary>
    /// 添加记录
    /// </summary>
    /// <param name="ds">数据库对象结构信息</param>
    public void insert(DataSet ds)
    {
        //测试地址 http://localhost:14744/sql.aspx?db=daSystem&sqlname=pub_tree&opt=insert&t_id=&t_pid=0000&t_tag=user&getds=
        string name;                    //当前字段名
        string value;                   //当前字段值

        string pkName = "";             //主键名
        string pkValue = "";            //主键值

        bool isIdent;                   //是否是自增字段
        bool isPK;                      //是否是主键
        bool isIdentPK = false;         //主键是否是自增字段

        DataRow[] rows;
        DataRow rowCur;

        StringBuilder sqltext = new StringBuilder();
        List<string> arrVar = new List<string>();                 //全部字段变量名
        List<string> arrName = new List<string>();                //全部字段名
        List<SqlParameter> arrParam = new List<SqlParameter>();   //sql参数
        List<string> arrCondition = new List<string>();           //sql条件代码


        for (int i = 0; i < Request.Params.Count; i++)
        {
            name = Request.Params.GetKey(i);
            if (null == name) continue;
            if (null != Request.ServerVariables[name]) continue;    //排除非用户提交参数。

            rows = ds.Tables[0].Select("name='" + name + "'");         //验证是否是有效的字段名。
            if (0 == rows.Length) continue;

            rowCur = rows[0];                                            //存在该字段，并取出用户提交的值。
            value = Functions.tostr(Request.Params[i].ToString()).Trim();

            isIdent = false;                          //清除状态
            isPK = false;

            if ("√" == rowCur["ident"].ToString())
            {
                isIdent = true;
            }
            if ("0" == rowCur["pk"].ToString())
            {
                isPK = true;
            }

            if (isIdent && isPK)
            {
                isIdentPK = true;                      //主键是自增字段
                pkName = name;                         //获得主键名

                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));   //验证并添加 sql条件参数

                arrCondition.Add(name + " = @" + name);               //sql条件参数(有getds参数时用)
            }

            if (isIdent) continue;      //自增字段，不做下面处理
            if (isPK)                   //主键，但不是自增字段
            {
                pkName = name;          //获得主键名

                if ("" == value)        //需要通过getNewPK生产一个主键值
                {
                    _dbhelper.OpenDB();
                    value = _dbhelper.getNewPK(_sqlname);
                    _dbhelper.CloseDB();
                    if ("" == value)    //生产主键值失败
                    {
                        Response.Write("error:" + _dbhelper._sError);
                        Response.End();
                    }
                }
                pkValue = value;

                arrVar.Add("@" + name);                               //验证并 sql赋值参数
                arrName.Add(name);
                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));

                arrCondition.Add(name + " = @" + name);               //sql条件参数
            }
            else                        //不是主键，也不是自增字段
            {
                if (value == "") continue;

                arrVar.Add("@" + name);
                arrName.Add(name);
                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));   //验证并添加 sql赋值参数
            }
        }

        if ( !isIdentPK && "" == pkName ) {
            Response.Write("error:需要提交主键值");
            Response.End();
        }

        sqltext.Append("insert into " + _sqlname + "(");
        sqltext.Append(string.Join(",", arrName.ToArray()));
        sqltext.Append(")values(");
        sqltext.Append(string.Join(",", arrVar.ToArray()) + ");");

        _dbhelper.OpenDB();
        if (Request["getds"] != null)                                   //需要返回新添记录数据集
        {
            sqltext.Append("select *, ''  tools  from " + _sqlname);
            sqltext.Append(" where " + string.Join(" and ", arrCondition.ToArray()));

            DataSet dsNew = _dbhelper.getDataSet(sqltext.ToString(), arrParam.ToArray());
            if (null != dsNew && 0 < dsNew.Tables[0].Rows.Count)
            {
                Response.ContentType = "text/xml";
                dsNew.WriteXml(Response.OutputStream);
            }
            else
            {
                Response.Write("error:" + _dbhelper._sError);
            }
        }
        else
        {
            if (0 < _dbhelper.runsql(sqltext.ToString(), arrParam.ToArray()))
            {
                if (isIdentPK)          //主键为自增字段，查询最新添加记录的主键值
                {
                    pkValue = _dbhelper.getObject("select max(" + pkName + " ) pk  from " + _sqlname + " where (1>0)").ToString();
                }

                Response.Write(pkValue);
            }
            else
            {
                Response.Write("error:" + _dbhelper._sError);
            }
        }

        _dbhelper.CloseDB();
        Response.End();

    }

    /// <summary>
    /// 删除记录
    /// </summary>
    /// <param name="ds">数据库对象结构信息</param>
    public void delete(DataSet ds)
    {
        //测试地址 http://localhost:14744/sql.aspx?db=daSystem&sqlname=pub_tree&opt=delete&t_id=00932
        string name;                    //当前字段名
        string value;                   //当前字段值

        string pkName = "";             //主键名
        string pkValue = "";            //主键值

        bool isPK;                      //是否是主键
        bool hasPK = false;             //是否有传入主键值
        bool isCondition;               //参数是否作为筛选条件

        DataRow[] rows;
        DataRow rowCur;

        StringBuilder sqltext = new StringBuilder();
        List<SqlParameter> arrParam = new List<SqlParameter>();   //sql参数
        List<string> arrCondition = new List<string>();           //sql条件代码


        for (int i = 0; i < Request.Params.Count; i++)
        {
            name = Request.Params.GetKey(i);
            if (null == name) continue;
            if (null != Request.ServerVariables[name]) continue;      //排除非用户提交参数。

            isCondition = false;                //清除标记
            if (0 == name.IndexOf("pk*"))      //该参数要作为筛选条件
            {
                isCondition = true;
                name = name.Substring(3);       //去前缀
            }

            rows = ds.Tables[0].Select("name='" + name + "'");         //验证是否是有效的字段名。
            if (0 == rows.Length) continue;

            rowCur = rows[0];                                            //存在该字段，并取出用户提交的值。
            value = Functions.tostr(Request.Params[i].ToString()).Trim();

            isPK = false;                       //清除标记
            if ("0" == rowCur["pk"].ToString())       //判断是否是主键
            {
                isPK = true;
                hasPK = true;
            }

            if (isPK)                           //通过主键值筛选删除操作
            {
                pkName = name;
                pkValue = value;

                arrCondition.Add(name + " = @" + name);
                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));   //验证并添加 条件sql参数
            }

            if (isCondition)                    //非主键值筛选删除操作
            {
                arrCondition.Add(name + " = @" + name);
                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));   //验证并添加 条件sql参数
            }
        }

        if (0 >= arrCondition.Count)
        {
            Response.Write("error:记录删除操作需要提交查找条件。");
        }
        else
        {
            sqltext.Append("delete from " + _sqlname + " where " + string.Join(",", arrCondition.ToArray()));

            _dbhelper.OpenDB();
            int nline = _dbhelper.runsql(sqltext.ToString(), arrParam.ToArray());

            if (0 < nline)
            {
                if (hasPK)                  //通过主键筛选删除，返回主键值；反之返回影响行数
                {
                    Response.Write(pkValue);
                }
                else
                {
                    Response.Write(nline);
                }
            }
            else
            {
                Response.Write("error:" + _dbhelper._sError);
            }
            _dbhelper.CloseDB();
        }
        Response.End();

    }

    /// <summary>
    /// 更新记录
    /// </summary>
    /// <param name="ds">数据库对象结构信息</param>
    public void update(DataSet ds)
    {
        //测试地址 http://localhost:14744/sql.aspx?db=daSystem&sqlname=pub_tree&opt=update&pk*t_tag=&t_name=%E5%93%88%E5%93%88%E5%93%88&getds=
        string name;                    //当前字段名
        string value;                   //当前字段值

        string pkName = "";             //主键名
        string pkValue = "";            //主键值

        //bool isIdent;                   //是否是自增字段
        bool isPK;                      //是否是主键
        //bool isIdentPK = false;         //主键是否是自增字段
        bool hasPK = false;             //是否有传入主键值
        bool isCondition;               //参数是否作为筛选条件

        DataRow[] rows;
        DataRow rowCur;

        StringBuilder sqltext = new StringBuilder();
        List<SqlParameter> arrParam = new List<SqlParameter>();   //sql参数
        List<string> arrSet = new List<string>();                 //赋值代码
        List<string> arrCondition = new List<string>();           //sql条件代码


        for (int i = 0; i < Request.Params.Count; i++)
        {
            name = Request.Params.GetKey(i);
            if (null == name) continue;
            if (null != Request.ServerVariables[name]) continue;    //排除非用户提交参数。

            isCondition = false;                //清除标记
            if (0 == name.IndexOf("pk*"))      //该参数要作为筛选条件
            {
                isCondition = true;
                name = name.Substring(3);       //去前缀
            }

            rows = ds.Tables[0].Select("name='" + name + "'");         //验证是否是有效的字段名。
            if (0 == rows.Length) continue;

            rowCur = rows[0];                                            //存在该字段，并取出用户提交的值。
            value = Functions.tostr(Request.Params[i].ToString()).Trim();

            //isIdent = false;                         //清除状态
            isPK = false;

            //if ("√" == rowCur["ident"].ToString())
            //{
            //    isIdent = true;
            //}
            if ("0" == rowCur["pk"].ToString())
            {
                isPK = true;
                hasPK = true;
            }

            //if (isIdent && isPK)
            //{
            //    isIdentPK = true;                      //主键是自增字段
            //    pkName = name;                         //获得主键名
            //    pkValue = value;                       //获得主键值

            //    arrCondition.Add(name + " = @" + name);
            //    arrParam.Add(_dbhelper.getSqlParam(rowCur, value));   //验证并添加 sql条件参数
            //}
            //if (isIdent) continue;    //自增字段，不做下面处理


            if (isPK)                   //通过主键值筛选删除操作
            {
                pkName = name;          //获得主键名
                pkValue = value;        //获得主键值

                arrCondition.Add(name + " = @" + name);                     //验证并添加 sql条件参数
                arrParam.Add(_dbhelper.getSqlParam(rowCur, value));
            }
            else
            {
                if (isCondition)        //非主键值作为筛选条件
                {
                    arrCondition.Add(name + " = @" + name);
                    arrParam.Add(_dbhelper.getSqlParam(rowCur, value));     //验证并添加 条件sql参数
                }
                else                    //赋值参数
                {
                    arrSet.Add(name + " = @" + name);                       //验证并添加 sql赋值参数
                    arrParam.Add(_dbhelper.getSqlParam(rowCur, value));
                }

            }
        }


        if (0 >= arrCondition.Count)
        {
            Response.Write("error:记录更新操作需要提交查找条件。");
        }
        else if (0 >= arrSet.Count)
        {
            Response.Write("error:记录更新操作需要提交更新字段和新数据。");
        }
        else
        {
            sqltext.Append("update " + _sqlname);
            sqltext.Append(" set " + string.Join(",", arrSet.ToArray()));
            sqltext.Append(" where " + string.Join(",", arrCondition.ToArray()) + ";");

            _dbhelper.OpenDB();
            if (null != Request["getds"])    //需要返回刚修改完的记录数据集
            {
                sqltext.Append("select *, ''  tools  from " + _sqlname);
                sqltext.Append(" where " + string.Join(" and ", arrCondition.ToArray()));

                DataSet dsNew = _dbhelper.getDataSet(sqltext.ToString(), arrParam.ToArray());
                if (0 < dsNew.Tables[0].Rows.Count)
                {
                    Response.ContentType = "text/xml";
                    dsNew.WriteXml(Response.OutputStream);
                }
                else
                {
                    Response.Write("error:" + _dbhelper._sError);
                }
            }
            else
            {
                int nline = _dbhelper.runsql(sqltext.ToString(), arrParam.ToArray());

                if (0 < nline)
                {
                    if (hasPK)                  //通过主键筛选更新，返回主键值；反之返回影响行数
                    {
                        Response.Write(pkValue);
                    }
                    else
                    {
                        Response.Write(nline);
                    }
                }
                else
                {
                    Response.Write("error:" + _dbhelper._sError);
                }
            }

            _dbhelper.CloseDB();
        }

        Response.End();

    }

    /// <summary>
    /// 查询数据集
    /// </summary>
    /// <param name="ds">数据库对象结构信息</param>
    public void query(DataSet ds)
    {
        //测试地址 http://localhost:14744/sql.aspx?db=daSystem&sqlname=pub_tree&opt=query&pagesize=3&pageindex=1&qry=
        string name;                    //当前字段名
        string value;                   //当前字段值

        string top = "";                //top值
        string field = "";              //select只提取部分字段（,分隔）
        string group = "";              //group by分组字段（,分隔）
        string order = "";              //order by排序字段（,分隔）

        DataRow[] rows;
        DataRow rowCur;

        StringBuilder sqltext = new StringBuilder();
        List<SqlParameter> arrParam = new List<SqlParameter>();   //sql参数
        List<string> arrCondition = new List<string>();           //sql条件代码

        for (int i = 0; i < Request.Params.Count; i++)
        {
            name = Request.Params.GetKey(i);
            if (null == name) continue;
            if (null != Request.ServerVariables[name]) continue;        //排除非用户提交参数。

            rows = ds.Tables[0].Select("name='" + name + "'");      //验证是否是有效的字段名。
            if (0 == rows.Length) continue;

            rowCur = rows[0];                                       //存在该字段，并取出用户提交的值。
            value = Functions.tostr(Request.Params[i].ToString()).Trim();

            if ("" == value) continue;

            arrCondition.Add(name + " = @" + name);                 //验证并添加 sql条件参数
            arrParam.Add(_dbhelper.getSqlParam(rowCur, value));

        }

        sqltext.Append("select");

        if (null != Request["top"])               //只取前几条数据;
        {
            top = Request["top"].ToString().Trim();
        }
        sqltext.Append("" != top ? " top " + top : "");

        if (null != Request["field"])             //只提取部分字段;
        {
            field = Request["field"].ToString().Trim();
        }
        sqltext.Append("" != field ? " " + field : " *, '' tools ");


        sqltext.Append(" from " + _sqlname);        //过滤筛选条件
        if (0 < arrCondition.Count)
        {
            sqltext.Append(" where " + string.Join(",", arrCondition.ToArray()));
        }

        if (null != Request["group"])               //分组字段;
        {
            group = Request["group"].ToString().Trim();
        }
        sqltext.Append("" != group ? " group by " + group : "");

        if (null != Request["order"])               //排序字段;
        {
            order = Request["order"].ToString().Trim();
        }
        else
        {
            rows = ds.Tables[0].Select("pk=0");    //用户没有提交order参数就取主键为排序字段
            if (rows.Length > 0)
            {
                order = rows[0]["name"].ToString() + " desc";
            }
            else                                    //表没有主键，就取第一个字段为排序字段
            {
                order = ds.Tables[0].Rows[0]["name"].ToString() + " desc";
            }
        }
        sqltext.Append("" != order ? " order by " + order : "");

        DataSet dsNew;



        _dbhelper.OpenDB();
        if (Request["qry"] != null &&
            Request["pagesize"] != null &&
            Request["pageindex"] != null)      //需要分页包裹
        {
            dsNew = _dbhelper.getPage(
                sqltext.ToString(),
                order,
                arrParam,
                Convert.ToBoolean("1" == Request["qry"].ToString()),
                Convert.ToInt32(Request["pagesize"].ToString()),
                Convert.ToInt32(Request["pageindex"].ToString()));

            if (null != dsNew && 0 < dsNew.Tables[0].Rows.Count)
            {
                Response.ContentType = "text/xml";
                dsNew.WriteXml(Response.OutputStream);
            }
            else
            {
                Response.Write("error:" + _dbhelper._sError);
            }
        }
        else
        {                                       //取全部数据
            dsNew = _dbhelper.getDataSet(sqltext.ToString(), arrParam.ToArray());

            if (null != dsNew && 0 < dsNew.Tables[0].Rows.Count)
            {
                Response.ContentType = "text/xml";
                dsNew.WriteXml(Response.OutputStream);
            }
            else
            {
                Response.Write("error:" + _dbhelper._sError);
            }
        }
        _dbhelper.CloseDB();
        Response.End();
    }






}